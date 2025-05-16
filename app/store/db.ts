import { supabase } from "~/supabase";
import type { AppDispatch } from "./store";
import type { Dispatch, SetStateAction } from "react";
import type { Map } from "~/types";
import setReduxMaps from "~/store/maps-slice";
import { toast } from "sonner";

import { v4 as uuidv4 } from "uuid";
import mapsSlice from "~/store/maps-slice";

export async function uploadImage(image: File): Promise<string | undefined> {
  try {
    const extension = image.name.split(".").pop();
    const key = `${uuidv4()}.${extension}`;

    if (!supabase) {
      throw new Error("Supabase is not initialized.");
    }

    const { data, error } = await supabase.storage
      .from("images")
      .upload(key, image);

    if (error) throw error;

    return data.path;
  } catch (e) {
    toast.error(`Failed to upload image: ${e}!`);
  }
}

export async function bumpViews(mapId: number) {
  if (supabase) {
    const { data, error: fetchErr } = await supabase
      .from("maps")
      .select("views")
      .eq("id", mapId)
      .single();

    if (fetchErr || !data) throw fetchErr || new Error("Not found");

    const { error: updateErr } = await supabase
      .from("maps")
      .update({ views: data.views + 1 })
      .eq("id", mapId);

    if (updateErr) console.error("Failed to bump views:", updateErr);
  }
}

export async function fetchMaps(
  filter: string = "",
  dispatch: AppDispatch,
  setLocalMaps: Dispatch<SetStateAction<Map[]>>
) {
  if (!supabase) return;

  let query = supabase
    .from("maps")
    .select(
      `id, created_at, author, title, images, tags, tmx_link, views, author_display`
    );

  if (filter) {
    const filters = filter
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    const titleFilters = filters.map((f) => `title.ilike.%${f}%`).join(",");

    const authorFilters = filters.map((f) => `author.ilike.%${f}%`).join(",");

    const tagsFilters = filters.length ? `tags.cs.{${filters.join(",")}}` : "";

    const orFilters = [titleFilters, authorFilters, tagsFilters]
      .filter(Boolean)
      .join(",");

    query = query.or(orFilters);
  }

  query = query.order("views", { ascending: false });

  const { data, error } = await query.range(0, 50);

  if (error) {
    toast.error(`Fetch Error: ${error}`);
    console.error("Supabase fetch error:", error);
    return;
  }

  const mapsArray = data || [];

  setLocalMaps(mapsArray);
  mapsSlice.actions.setMaps(mapsArray);
  dispatch(setReduxMaps.actions.setMaps(mapsArray));
}

export async function getMap(mapId: string) {
  if (!supabase) return;

  const { data, error } = await supabase
    .from("maps")
    .select(
      `id, created_at, author, title, images, tags, tmx_link, views, author_display`
    )
    .eq("id", mapId)
    .single();

  if (error) {
    toast.error(`Fetch Error: ${error.message}`);
    console.error("Supabase fetch error:", error);
    return null;
  }

  return data;
}

export async function uploadMap(map: Omit<Map, "id">) {
  if (supabase) {
    const { data, error: updateErr } = await supabase
      .from("maps")
      .insert(map)
      .select();

    if (updateErr) {
      console.error("Failed to upload map:", updateErr.message);
      toast.error(`Failed to upload map: ${updateErr.message}`);
    } else {
      toast.info("Successfully uploaded map.");
    }
  }
}

async function deleteImages(bucketName: string, imageKeys: string[]) {
  if (!supabase) {
    toast.error("Failed to delete image, supabase is not initialized!");
    return;
  }

  const { data: files, error: listError } = await supabase.storage
    .from(bucketName)
    .list("", { limit: 1000 });

  if (listError) {
    console.error("Error listing images:", listError);
    toast.error(`Failed to list images: ${listError.message}!`);
    return;
  }

  const filesToDelete = files
    .filter((file) => imageKeys.some((key) => file.name.startsWith(key)))
    .map((file) => file.name);

  if (filesToDelete.length === 0) {
    console.log("No matching files to delete.");
    return;
  }

  const { data, error } = await supabase.storage
    .from(bucketName)
    .remove(filesToDelete);

  if (error) {
    console.error("Error deleting images:", error);
    toast.error(`Failed to delete image ${error.message}!`);
    return;
  }

  console.log("Deleted:", data);
  return data;
}

export async function deleteMap(mapId: number, dispatch?: AppDispatch) {
  if (!supabase) {
    toast.error("Supabase not initialized.");
    return;
  }

  try {
    const { data: mapData, error: fetchErr } = await supabase
      .from("maps")
      .select("images")
      .eq("id", mapId)
      .single();

    if (fetchErr || !mapData) {
      toast.error("Map not found.");
      return;
    }

    const images = mapData.images;
    console.log(images);

    deleteImages("images", images);

    const { error } = await supabase.from("maps").delete().eq("id", mapId);

    if (error) {
      toast.error(`Failed to delete map: ${error.message}`);
      console.error("Failed to delete map:", error);
    } else {
      toast.info("Map deleted successfully.");
      if (dispatch) {
        await fetchMaps("", dispatch, () => {});
      }
    }
  } catch (e) {
    toast.error(`Failed to delete map: ${e}`);
    console.error("Delete map error:", e);
  }
}

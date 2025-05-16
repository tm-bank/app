import { supabase } from "~/supabase";
import type { AppDispatch } from "./store";
import type { Dispatch, SetStateAction } from "react";
import type { Map } from "~/types";
import setReduxMaps from "~/store/maps-slice";
import { toast } from "sonner";

export async function uploadImage(
  fileName: string,
  image: File
): Promise<string | undefined> {
  if (!supabase) {
    toast.error("Failed to upload image!");
    return "";
  }
  try {
    const { data, error } = await supabase.storage
      .from("images")
      .upload(fileName, image);

    if (error) {
      throw new Error(error.message);
    }

    return "https://wgztuhhevsawvztlqsfp.supabase.co/storage/v1/object/public/" + data?.fullPath;
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
  dispatch(setReduxMaps.actions.setMaps(mapsArray));
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

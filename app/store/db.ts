import { supabase } from "~/supabase";
import type { AppDispatch } from "./store";
import type { Dispatch, SetStateAction } from "react";
import type { Map } from "~/types";
import setReduxMaps from "~/store/maps-slice";

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

export async function fetchMaps(filter: string = "", dispatch: AppDispatch, setLocalMaps: Dispatch<SetStateAction<Map[]>>) {
  if (!supabase) return;

  let query = supabase
    .from("maps")
    .select(`id, created_at, author, title, images, tags, tmx_link, views`);

  if (filter) {
    query = query.or(
      `title.ilike.%${filter}%,author.ilike.%${filter}%,tags.cs.{${filter}}`
    );
  }

  query = query.order("views", { ascending: false });

  const { data, error } = await query.range(0, 50);

  if (error) {
    console.error("Supabase fetch error:", error);
    return;
  }

  const mapsArray = data || [];

  setLocalMaps(mapsArray);
  dispatch(setReduxMaps.actions.setMaps(mapsArray));
}

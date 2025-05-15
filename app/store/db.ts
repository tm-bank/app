import { supabase } from "~/supabase";

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

import type { Dispatch, SetStateAction } from "react";
import type { MapDataRow } from "~/types";
import type { AppDispatch } from "./store";
import mapsSlice from "./maps-slice";

import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

export async function searchMaps(
  q: string = "",
  dispatch: AppDispatch,
  setLocalMaps: Dispatch<SetStateAction<MapDataRow[]>>
) {
  const params = new URLSearchParams();

  const tokens = q
    .split(/[\s,]+/)
    .map((v) => v.trim())
    .filter(Boolean);

  let author = "";
  let searchTerms: string[] = [];

  tokens.forEach((token) => {
    if (token.startsWith("author:")) {
      author = token.replace("author:", "");
    } else {
      searchTerms.push(token);
    }
  });

  if (searchTerms.length > 0) params.append("q", searchTerms.join(" "));
  if (author) params.append("author", author);

  try {
    const res = await fetch(`${API_URL}/maps/search?${params.toString()}`, {
      credentials: "include",
      headers: {
        "x-auth-key": import.meta.env.VITE_AUTH_KEY || "",
      },
    });

    if (res.ok) {
      const data = await res.json();
      setLocalMaps(data);
      dispatch(mapsSlice.actions.setMaps(data));
    }
  } catch (e) {
    toast.error(`Failed to search maps: ${e}`);
  }
}

import type { Dispatch, SetStateAction } from "react";
import type { Map, User } from "~/types";
import type { AppDispatch } from "./store";
import { toast } from "sonner";
import mapsSlice from "./maps-slice";

export async function searchMaps(
  q: string = "",
  dispatch: AppDispatch,
  setLocalMaps: Dispatch<SetStateAction<Map[]>>
) {
  try {
    const filters: Record<string, string> = {};
    const tags: string[] = [];

    q.split(",").forEach((part) => {
      const trimmed = part.trim();
      const [key, ...rest] = trimmed.split(":");
      if (rest.length > 0) {
        filters[key.toLowerCase()] = rest.join(":").trim();
      } else if (trimmed) {
        tags.push(trimmed);
      }
    });

    const params = new URLSearchParams();
    if (filters.title) params.append("title", filters.title);
    if (filters.author) params.append("author", filters.author);
    if (tags.length > 0) params.append("tags", tags.join(","));

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/maps/search?${params.toString()}`,
      { credentials: "include" }
    );
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();

    setLocalMaps(data);
    dispatch(mapsSlice.actions.setMaps(data));
  } catch (e) {
    toast.error(`Failed to search maps: ${e}`);
  }
}

export async function getMap(id: string = "") {
  try {
    throw Error("Unimplemented!");
  } catch (e) {
    toast.error(`Failed to get map: ${e}`);
  }
}

export async function deleteMap(id: string = "") {
  try {
    throw Error("Unimplemented!");
  } catch (e) {
    toast.error(`Failed to get map: ${e}`);
  }
}

export async function uploadMap(id: string = "") {
  try {
    throw Error("Unimplemented!");
  } catch (e) {
    toast.error(`Failed to get map: ${e}`);
  }
}

export async function findAuthorFromid(
  id: string = ""
): Promise<User | undefined> {
  try {
  } catch (e) {
    toast.error(`Failed to find author: ${e}`);
    return undefined;
  }
}

export async function getUser(id: string = ""): Promise<User | undefined> {
  try {
    const params = new URLSearchParams();

    params.append("queryId", id);

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/maps/search?${params.toString()}`,
      { credentials: "include" }
    );

    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();
    return data;
  } catch (e) {
    toast.error(`Failed to get user: ${e}`);
  }
}

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

    if (q) {
      q.split(",").forEach((part) => {
        const trimmed = part.trim();
        if (!trimmed) return;

        const [key, ...rest] = trimmed.split(":");
        if (rest.length > 0) {
          filters[key.toLowerCase()] = rest.join(":").trim();
        } else if (trimmed) {
          tags.push(trimmed);
        }
      });
    }

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

    if (setLocalMaps) {
      try {
        setLocalMaps(data);
      } catch (error) {
        console.error("Error setting local maps:", error);
      }
    }

    dispatch(mapsSlice.actions.setMaps(data));

    return data;
  } catch (e) {
    console.error(`Failed to search maps:`, e);
    toast.error(`Failed to search maps: ${e}`);
    return [];
  }
}

export async function getMap(id: string = "") {
  if (!id) return undefined;

  try {
    const params = new URLSearchParams();
    params.append("queryId", id);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/map/${id}`, {
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();
    return data;
  } catch (e: any) {
    if (e.name === "AbortError") {
      console.error(`Request for map ${id} timed out`);
      return undefined;
    }

    console.error(`Failed to get map:`, e);
    toast.error(`Failed to get map: ${e}`);
    return undefined;
  }
}

export async function deleteMap(id: string = "") {
  if (!id) return false;

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/maps/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mapId: id,
      }),
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to upload map");
    }

    return await res.json();
  } catch (e) {
    console.error(`Failed to delete map:`, e);
    toast.error(`Failed to delete map: ${e}`);
    return false;
  }
}

export async function uploadMap(data: {
  title: string;
  view_link?: string;
  tags: string[];
  images: string[];
}) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/maps/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: data.title,
      viewLink: data.view_link,
      tags: data.tags,
      images: data.images,
    }),
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to upload map");
  }

  return await res.json();
}

export async function findAuthorFromid(
  id: string = ""
): Promise<User | undefined> {
  if (!id) return undefined;

  try {
    return await getUser(id);
  } catch (e) {
    console.error(`Failed to find author:`, e);
    toast.error(`Failed to find author: ${e}`);
    return undefined;
  }
}

export async function getUser(id: string = ""): Promise<User | undefined> {
  if (!id) return undefined;

  try {
    const params = new URLSearchParams();
    params.append("queryId", id);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/user?${params.toString()}`,
      {
        credentials: "include",
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();
    return data;
  } catch (e: any) {
    if (e.name === "AbortError") {
      console.error(`Request for user ${id} timed out`);
      return undefined;
    }

    console.error(`Failed to get user:`, e);
    toast.error(`Failed to get user: ${e}`);
    return undefined;
  }
}

import type { Dispatch, SetStateAction } from "react";
import type { Block, Map, User } from "~/types";
import type { AppDispatch } from "./store";
import { toast } from "sonner";
import mapsSlice from "./maps-slice";
import blocksSlice from "./blocks-slice";

// Unified search for maps or blocks
export async function search(
  q: string = "",
  dispatch: AppDispatch,
  setLocalMaps: Dispatch<SetStateAction<(Map | Block)[]>>,
  blocks: boolean
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

    const endpoint = blocks
      ? `${import.meta.env.VITE_API_URL}/blocks/search?${params.toString()}`
      : `${import.meta.env.VITE_API_URL}/maps/search?${params.toString()}`;

    const res = await fetch(endpoint, { credentials: "include" });

    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();

    if (setLocalMaps) {
      try {
        setLocalMaps(data);
      } catch (error) {
        console.error("Error setting local maps:", error);
      }
    }

    if (blocks) {
      dispatch(blocksSlice.actions.setBlocks(data));
    } else {
      dispatch(mapsSlice.actions.setMaps(data));
    }

    return data;
  } catch (e) {
    console.error(`Failed to search ${blocks ? "blocks" : "maps"}:`, e);
    toast.error(`Failed to search ${blocks ? "blocks" : "maps"}: ${e}`);
    return [];
  }
}

export async function getMap(id: string = "") {
  if (!id) return undefined;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/maps/${id}`, {
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
      throw new Error(error.error || "Failed to delete map");
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
  blockIds?: string[];
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
      blockIds: data.blockIds, // many-to-many
    }),
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to upload map");
  }

  return await res.json();
}

export async function findAuthorFromMap(map: Map): Promise<User | undefined> {
  if (!map) return undefined;

  try {
    return await getUser(map.authorId);
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
    const timeoutId = setTimeout(() => controller.abort(), 5000);

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

export async function castVote(
  user: User,
  map: Map,
  up: boolean
): Promise<boolean> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/maps/vote`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        mapId: map.id,
        up,
      }),
    });

    if (!res.ok) {
      toast.error("Failed to cast vote");
      return false;
    }

    toast.success(up ? "Upvoted!" : "Downvoted!");
    return true;
  } catch (e) {
    toast.error("Failed to cast vote.");
    return false;
  }
}

export async function castVoteBlock(
  user: User,
  block: Block,
  up: boolean
): Promise<boolean> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/blocks/vote`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        blockId: block.id,
        up,
      }),
    });

    if (!res.ok) {
      toast.error("Failed to cast vote");
      return false;
    }

    toast.success(up ? "Upvoted!" : "Downvoted!");
    return true;
  } catch (e) {
    toast.error("Failed to cast vote.");
    return false;
  }
}

export async function editMap(
  mapId: string,
  data: {
    title?: string;
    view_link?: string;
    tags?: string[];
    images?: string[];
    blockIds?: string[];
  }
) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/maps/${mapId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      title: data.title,
      viewLink: data.view_link,
      tags: data.tags,
      images: data.images,
      blockIds: data.blockIds, // many-to-many
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update map");
  }

  return await res.json();
}

export async function uploadBlock(data: {
  title: string;
  tags: string[];
  file?: File;
  image?: string;
  mapIds?: string[]; // for many-to-many, if you want to link blocks to maps from the block side
}) {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("tags", JSON.stringify(data.tags));

  if (data.file) {
    formData.append("file", data.file);
  }
  if (data.image) {
    formData.append("image", data.image);
  }
  if (data.mapIds && Array.isArray(data.mapIds)) {
    formData.append("mapIds", JSON.stringify(data.mapIds));
  }

  const res = await fetch(`${import.meta.env.VITE_API_URL}/blocks/`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to upload block");
  }

  return await res.json();
}

export async function editBlock(
  blockId: string,
  data: {
    title?: string;
    view_link?: string;
    tags?: string[];
    file?: File;
    image?: string;
    mapIds?: string[]; // for many-to-many
  }
) {
  const formData = new FormData();
  if (data.title) formData.append("title", data.title);
  if (data.view_link) formData.append("viewLink", data.view_link);
  if (data.tags) formData.append("tags", JSON.stringify(data.tags));

  if (data.file) {
    formData.append("file", data.file);
  }
  if (data.image) {
    formData.append("image", data.image);
  }
  if (data.mapIds && Array.isArray(data.mapIds)) {
    formData.append("mapIds", JSON.stringify(data.mapIds));
  }

  const res = await fetch(`${import.meta.env.VITE_API_URL}/blocks/${blockId}`, {
    method: "PUT",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update block");
  }

  return await res.json();
}

export async function uploadBlockFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${import.meta.env.VITE_API_URL}/blocks/upload`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to upload file");
  }

  return await res.json();
}

export async function deleteBlock(id: string = "") {
  if (!id) return false;

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/blocks/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        blockId: id,
      }),
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to delete block");
    }

    return true;
  } catch (e) {
    console.error(`Failed to delete block:`, e);
    toast.error(`Failed to delete block: ${e}`);
    return false;
  }
}

export async function getBlock(id: string = "") {
  if (!id) return undefined;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/blocks/${id}`, {
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();
    return data;
  } catch (e: any) {
    if (e.name === "AbortError") {
      console.error(`Request for block ${id} timed out`);
      return undefined;
    }

    console.error(`Failed to get block:`, e);
    toast.error(`Failed to get block: ${e}`);
    return undefined;
  }
}

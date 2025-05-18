import type { Dispatch, SetStateAction } from "react";
import type { Map, User } from "~/types";
import type { AppDispatch } from "./store";
import { toast } from "sonner";

export async function searchMaps(
  q: string = "",
  dispatch: AppDispatch,
  setLocalMaps: Dispatch<SetStateAction<Map[]>>
) {
  try {
    throw Error("Unimplemented!");
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

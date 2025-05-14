import { createAsyncThunk } from "@reduxjs/toolkit";
import type { SceneryItem } from "./store";

export const API_LINK = "https://tm-scenery-bank-api.vercel.app";

export const fetchInitialResults = createAsyncThunk(
  "results/fetchInitial",
  async () => {
    const res = await fetch(API_LINK + "/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filter: {
          viewSort: "ascending",
          categories: [],
          name: "",
        },
      }),
    });

    if (!res.ok) throw new Error("Failed to fetch maps");
    return (await res.json()) as SceneryItem[];
  }
);

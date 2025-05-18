import { createSlice } from "@reduxjs/toolkit";
import type { MapDataRow } from "~/types";

export interface MapsState {
  maps: MapDataRow[];
}

const initialMapsState = {
  maps: [],
} as MapsState;

const mapsSlice = createSlice({
  name: "maps",
  initialState: initialMapsState,
  reducers: {
    setMaps(state, action: { payload: MapDataRow[] }) {
      state.maps = action.payload;
    },
  },
});

export default mapsSlice;

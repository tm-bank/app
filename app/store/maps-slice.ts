import { createSlice } from "@reduxjs/toolkit";
import type { Map } from "~/types";

export interface MapsState {
  maps: Map[];
}

const initialMapsState = {
  maps: [],
} as MapsState;

const mapsSlice = createSlice({
  name: "maps",
  initialState: initialMapsState,
  reducers: {
    setMaps(state, action: { payload: Map[] }) {
      state.maps = action.payload;
    },
  },
});

export default mapsSlice;

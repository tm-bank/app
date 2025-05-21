import { createSlice } from "@reduxjs/toolkit";
import type { Block } from "~/types";

export interface BlocksState {
  blocks: Block[];
}

const initialMapsState = {
  blocks: [],
} as BlocksState;

const blocksSlice = createSlice({
  name: "blocks",
  initialState: initialMapsState,
  reducers: {
    setBlocks(state, action: { payload: Block[] }) {
      state.blocks = action.payload;
    },
  },
});

export default blocksSlice;

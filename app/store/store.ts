import { configureStore } from "@reduxjs/toolkit";
import mapsSlice from "./maps-slice";
import { useDispatch, useSelector, useStore } from "react-redux";

export const makeStore = () => {
  return configureStore({
    reducer: { maps: mapsSlice.reducer },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();

export const { setMaps } = mapsSlice.actions;
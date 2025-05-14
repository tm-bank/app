import {
  configureStore,
  createSlice,
  type ActionReducerMapBuilder,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { fetchInitialResults } from "./thunk";

// Types
type Category = string;

export interface SceneryItem {
  id: number;
  title: string;
  categories: string[];
  author: string;
  views: number;
  imageUrl: string;
  viewUrl?: string;
  new?: boolean;
}

interface Filter {
  viewSort: "ascending" | "descending";
  categories: Category[];
  name?: string;
}

interface CategoryState {
  categories: [Category, number][];
  filter: Filter;
}

interface ResultsState {
  results: SceneryItem[];
}

export function populateCategories(
  results: ResultsState
): [Category, number][] {
  const categoriesMap: { [key: string]: number } = {};

  results.results.forEach((item) => {
    item.categories.forEach((category) => {
      if (categoriesMap[category]) {
        categoriesMap[category]++;
      } else {
        categoriesMap[category] = 1;
      }
    });
  });

  return Object.entries(categoriesMap) as [Category, number][];
}

let initialMaps: SceneryItem[] = [];

const initialResultsState: ResultsState = {
  results: initialMaps,
};

const initialCategoryState: CategoryState = {
  categories: populateCategories(initialResultsState),
  filter: {
    viewSort: "descending",
    categories: [],
    name: "",
  },
};

const categorySlice = createSlice({
  name: "category",
  initialState: initialCategoryState,
  reducers: {
    setCategories(state, action: PayloadAction<[Category, number][]>) {
      state.categories = action.payload;
    },
    addCategory(state, action: PayloadAction<[Category, number]>) {
      if (!state.categories.includes(action.payload)) {
        state.categories.push(action.payload);
      }
    },
    removeCategory(state, action: PayloadAction<[Category, number]>) {
      state.categories = state.categories.filter(
        (cat) => cat !== action.payload
      );
    },
    setFilterName(state, action: PayloadAction<string>) {
      state.filter.name = action.payload;
    },
    setFilterCategories(state, action: PayloadAction<Category[]>) {
      state.filter.categories = action.payload;
    },
    addFilterCategory(state, action: PayloadAction<Category>) {
      if (!state.filter.categories.includes(action.payload)) {
        state.filter.categories.push(action.payload);
      }
    },
    removeFilterCategory(state, action: PayloadAction<Category>) {
      state.filter.categories = state.filter.categories.filter(
        (cat) => cat !== action.payload
      );
    },
  },
});

const resultsSlice = createSlice({
  name: "results",
  initialState: initialResultsState,
  reducers: {
    setResults(state, action: PayloadAction<ResultsState>) {
      state.results = action.payload.results;
    },
    clearResults(state) {
      state.results = [];
    },
    addResult(state, action: PayloadAction<SceneryItem>) {
      state.results.push(action.payload);
    },
    removeResultById(state, action: PayloadAction<number>) {
      state.results = state.results.filter(
        (item: SceneryItem) => item.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInitialResults.pending, (state) => {})
      .addCase(fetchInitialResults.fulfilled, (state, action) => {
        state.results = action.payload;
      })
      .addCase(fetchInitialResults.rejected, (state, action) => {
        console.error("fetchInitialResults failed:", action.error.message);
      });
  },
});

const store = configureStore({
  reducer: {
    category: categorySlice.reducer,
    results: resultsSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export const {
  setCategories,
  addCategory,
  removeCategory,
  setFilterName,
  setFilterCategories,
  addFilterCategory,
  removeFilterCategory,
} = categorySlice.actions;

export const { setResults, clearResults, addResult, removeResultById } =
  resultsSlice.actions;

export default store;

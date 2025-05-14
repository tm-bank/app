import {
  configureStore,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";

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
  categories: Category[];
  name: string;
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

const initialResultsState: ResultsState = {
  results: [
    {
      id: 0,
      author: "Unknown",
      title: "Unknown",
      categories: ["Unknown"],
      views: 0,
      imageUrl: "/placeholder.svg",
    },
    {
      id: 1,
      author: "Unknown",
      title: "Unknown 2",
      categories: ["Unknown"],
      views: 0,
      imageUrl: "/placeholder.svg",
    },
    {
      id: 2,
      author: "Unknown",
      title: "Unknown",
      categories: ["Unknown"],
      views: 0,
      imageUrl: "/placeholder.svg",
    },
    {
      id: 3,
      author: "Unknown",
      title: "Unknown",
      categories: ["Unknown"],
      views: 0,
      imageUrl: "/placeholder.svg",
    },
    {
      id: 4,
      author: "Unknown",
      title: "Unknown",
      categories: ["Unknown"],
      views: 0,
      imageUrl: "/placeholder.svg",
    },
    {
      id: 5,
      author: "Unknown",
      title: "Unknown",
      categories: ["Unknown"],
      views: 0,
      imageUrl: "/placeholder.svg",
    },
  ],
};

const initialCategoryState: CategoryState = {
  categories: populateCategories(initialResultsState),
  filter: {
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
    setResults(state, action: PayloadAction<SceneryItem[]>) {
      state.results = action.payload;
    },
    clearResults(state) {
      state.results = [];
    },
    addResult(state, action: PayloadAction<SceneryItem>) {
      state.results.push(action.payload);
    },
    removeResultById(state, action: PayloadAction<number>) {
      state.results = state.results.filter(
        (item) => item.id !== action.payload
      );
    },
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

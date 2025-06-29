import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ContentItem } from './contentSlice';

export interface SearchState {
  query: string;
  results: ContentItem[];
  loading: boolean;
  error: string | null;
}

const initialState: SearchState = {
  query: '',
  results: [],
  loading: false,
  error: null,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<ContentItem[]>) => {
      state.results = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSearchLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSearchError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearSearch: (state) => {
      state.query = '';
      state.results = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setSearchQuery,
  setSearchResults,
  setSearchLoading,
  setSearchError,
  clearSearch,
} = searchSlice.actions;

export default searchSlice.reducer; 
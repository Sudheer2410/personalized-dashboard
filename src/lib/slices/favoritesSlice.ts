import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ContentItem } from './contentSlice';

export interface FavoritesState {
  items: ContentItem[];
}

const initialState: FavoritesState = {
  items: [],
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addToFavorites: (state, action: PayloadAction<ContentItem>) => {
      const existingIndex = state.items.findIndex(item => item.id === action.payload.id);
      if (existingIndex === -1) {
        state.items.push(action.payload);
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearFavorites: (state) => {
      state.items = [];
    },
    loadFavorites: (state, action: PayloadAction<ContentItem[]>) => {
      state.items = action.payload;
    },
  },
});

export const {
  addToFavorites,
  removeFromFavorites,
  clearFavorites,
  loadFavorites,
} = favoritesSlice.actions;

export default favoritesSlice.reducer; 
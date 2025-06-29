import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserPreferences {
  theme: 'light' | 'dark';
  categories: string[];
  language: string;
  notifications: boolean;
}

const initialState: UserPreferences = {
  theme: 'light', // This will be overridden by ThemeProvider
  categories: ['entertainment', 'sports', 'news', 'technology'],
  language: 'en',
  notifications: true,
};

const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      console.log('setTheme action called with:', action.payload);
      console.log('Previous theme was:', state.theme);
      state.theme = action.payload;
      console.log('New theme is:', state.theme);
    },
    setCategories: (state, action: PayloadAction<string[]>) => {
      state.categories = action.payload;
    },
    addCategory: (state, action: PayloadAction<string>) => {
      if (!state.categories.includes(action.payload)) {
        state.categories.push(action.payload);
      }
    },
    removeCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(cat => cat !== action.payload);
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    toggleNotifications: (state) => {
      state.notifications = !state.notifications;
    },
  },
});

export const {
  setTheme,
  setCategories,
  addCategory,
  removeCategory,
  setLanguage,
  toggleNotifications,
} = userPreferencesSlice.actions;

export default userPreferencesSlice.reducer; 
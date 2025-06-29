import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import userPreferencesReducer from './slices/userPreferencesSlice';
import contentReducer from './slices/contentSlice';
import favoritesReducer from './slices/favoritesSlice';
import searchReducer from './slices/searchSlice';

const userPreferencesPersistConfig = {
  key: 'userPreferences',
  storage,
  whitelist: ['theme', 'categories', 'language', 'notifications'],
};

const persistedUserPreferencesReducer = persistReducer(userPreferencesPersistConfig, userPreferencesReducer);

export const store = configureStore({
  reducer: {
    userPreferences: persistedUserPreferencesReducer,
    content: contentReducer,
    favorites: favoritesReducer,
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 
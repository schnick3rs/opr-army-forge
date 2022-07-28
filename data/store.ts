import { configureStore } from '@reduxjs/toolkit';
import armyReducer from './armySlice';
import listReducer from './listSlice';
import appReducer from './appSlice';

export const store = configureStore({
  reducer: {
      army: armyReducer,
      list: listReducer,
      app: appReducer
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
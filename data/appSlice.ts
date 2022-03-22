import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface AppState {
  armyBookSelectionOpen: boolean;
}

const initialState: AppState = {
  armyBookSelectionOpen: false
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    toggleArmyBookSelectionOpen: (state, action: PayloadAction<boolean>) => {
      state.armyBookSelectionOpen = action.payload;
    },
  },
})

// Action creators are generated for each case reducer function
export const {
  toggleArmyBookSelectionOpen,
} = appSlice.actions

export default appSlice.reducer
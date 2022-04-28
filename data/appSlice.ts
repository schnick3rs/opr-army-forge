import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface AppState {
  openReleaseNotes: boolean;
}

const initialState: AppState = {
  openReleaseNotes: false
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setOpenReleaseNotes(state, action: PayloadAction<boolean>) {
      state.openReleaseNotes = action.payload;
    }
  },
})

// Action creators are generated for each case reducer function
export const { setOpenReleaseNotes } = appSlice.actions

export default appSlice.reducer
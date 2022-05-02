import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { nanoid } from 'nanoid';
import { ISaveData } from './interfaces';

export interface AppState {
  openReleaseNotes: boolean;
  cloudShare: {
    open: boolean;
    listId: string;
  }
}

const initialState: AppState = {
  openReleaseNotes: false,
  cloudShare: {
    open: false,
    listId: "oQxY_d"
  }
};

// POST to https://army-forge-api.azurewebsites.net/list

export const createCloudShare = createAsyncThunk("app/createCloudShare", async (save: ISaveData) => {

  const data = {
    password: nanoid(16),
    savedList: save
  };

  const res = await fetch("https://army-forge-api.azurewebsites.net/list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const json = res.json();

  console.log("Cloud sahre res", json);
  return json;
});

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setOpenReleaseNotes(state, action: PayloadAction<boolean>) {
      state.openReleaseNotes = action.payload;
    }
  },
  extraReducers(builder) {
    builder.addCase(createCloudShare.fulfilled, (state, action) => {
      return { ...state, cloudShare: { open: true, listId: action.payload } };
    });
  }
})

// Action creators are generated for each case reducer function
export const { setOpenReleaseNotes } = appSlice.actions

export default appSlice.reducer
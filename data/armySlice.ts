import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import { gameSystemToSlug } from '../services/Helpers';
import WebappApiService from '../services/WebappApiService';
import { IUnit, IUpgradePackage } from './interfaces';

export interface IGameRule {
  name: string;
  description: string;
  options: string[];
}

export interface ArmyState {
  loaded: boolean;
  loadingArmyData: boolean;
  gameSystem: string;
  armyFile: string;
  //data: IArmyData;
  rules: IGameRule[];
  armyBooks: IArmyData[];
  loadedArmyBooks: IArmyData[];
}

export interface IArmyData {
  uid: string;
  name: string;
  factionName: string;
  factionRelation: string;
  versionString: string;
  dataToolVersion: string;
  units: IUnit[];
  upgradePackages: IUpgradePackage[];
  specialRules: IGameRule[];
  spells: { id: string; name: string; effect: string; threshold: number; }[];
  isLive: boolean;
  official: boolean;
  coverImagePath: string;
  username?: string;
}

const initialState: ArmyState = {
  loaded: false,
  loadingArmyData: false,
  armyFile: null,
  gameSystem: null,
  //data: null,
  rules: [],
  armyBooks: [],
  loadedArmyBooks: []
}

export const getArmyBooks = createAsyncThunk("army/getArmyBooks", async (gameSystem: string) => {
  // AF to Web Companion game type mapping
  const slug = gameSystemToSlug(gameSystem);
  const apiArmyBooks = await WebappApiService.getArmyBooks(slug);
  console.log("Loaded army books", apiArmyBooks);
  return apiArmyBooks;
});

export const getArmyBookData = createAsyncThunk("army/getArmyBookData", async (payload: { armyUid: string, gameSystem: string }) => {
  const armyBookData: IArmyData = await WebappApiService.getArmyBookData(
    payload.armyUid,
    payload.gameSystem
  );
  console.log("Loaded army data", armyBookData);
  //payload.callback(armyBookData);
  return armyBookData;
});

export const armySlice = createSlice({
  name: 'army',
  initialState: initialState,
  reducers: {
    resetLoadedBooks(state) {
      state.loadedArmyBooks = [];
    },
    setGameSystem: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        gameSystem: action.payload
      };
    },
    setArmyFile: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        armyFile: action.payload
      };
    },
    setGameRules: (state, action: PayloadAction<IGameRule[]>) => {
      return {
        ...state,
        rules: action.payload
      };
    }
  },
  extraReducers(builder) {
    builder.addCase(getArmyBooks.fulfilled, (state, action) => {
      return { ...state, armyBooks: action.payload };
    });
    builder.addCase(getArmyBookData.pending, (state, action) => {
      return { ...state, loadingArmyData: true };
    });
    builder.addCase(getArmyBookData.fulfilled, (state, action: PayloadAction<IArmyData>) => {
      const armyData: IArmyData = action.payload;
      const existingIndex = state.loadedArmyBooks.findIndex(book => book.uid === armyData.uid);
      const alreadyExists = existingIndex >= 0;
      if (alreadyExists) {
        state.loadedArmyBooks.splice(existingIndex, 1);
      }
      state.loadedArmyBooks.push(armyData);
      state.loadingArmyData = false;
      state.loaded = true;
    });
  },
})

// Action creators are generated for each case reducer function
export const { resetLoadedBooks, setGameSystem, setArmyFile, setGameRules } = armySlice.actions;

export default armySlice.reducer;

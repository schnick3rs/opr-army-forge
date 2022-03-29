import { createSlice, current, PayloadAction } from '@reduxjs/toolkit'
import { makeCopy } from '../services/Helpers';
import PersistenceService from '../services/PersistenceService';
import { debounce } from 'throttle-debounce';

export interface ICampaignUnit {
  unitId: string;
  xp: number;
  traits: string[]; // Trait names only
}

export interface ITrait {
  id: string;
  name: string;
  description: string;
}

export interface ISkillSet {
  id: string;
  name: string;
  traits: ITrait[];
}

export interface CampaignState {
  saveKey: string;
  units: ICampaignUnit[];
}

const initialState: CampaignState = {
  saveKey: null,
  units: []
};

export const defaultCampaignUnit: ICampaignUnit = {
  unitId: "",
  xp: 0,
  traits: [],
};

const debounceSave = debounce(1500, (state: CampaignState) => {
  PersistenceService.updateCampaignSave(state);
});

export const campaignSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    initialiseCampaign(state, action: PayloadAction<string>) {
      const creationTime = action.payload;
      state.saveKey = creationTime;
    },
    loadCampaign(state, action: PayloadAction<CampaignState>) {
      return action.payload;
    },
    adjustXp(state, action: PayloadAction<{ unitId: string, xp: number }>) {
      const { unitId, xp } = action.payload;
      const unit = state.units.find(u => u.unitId === unitId);
      if (!unit) {
        const newUnit = makeCopy(defaultCampaignUnit);
        newUnit.unitId = unitId;
        newUnit.xp = xp;
        state.units.push(newUnit);
      } else {
        unit.xp += xp;
      }

      debounceSave(current(state));
    },
    toggleTrait(state, action: PayloadAction<{ unitId: string, trait: string }>) {
      const { unitId, trait } = action.payload;
      const unit = state.units.find(u => u.unitId === unitId);
      const existingTraitIndex = unit.traits.findIndex(t => t === trait);
      if (existingTraitIndex >= 0) {
        unit.traits.splice(existingTraitIndex, 1);
      } else {
        unit.traits.push(trait);
      }

      debounceSave(current(state));
    }
  },
});

const traitDefinitions = {
  "gf": {
    units: [
      {
        "name": "Agile",
        "description": "Moves +1” on advance and +2” on rush and charge."
      },
      {
        "name": "Headstrong",
        "description": "Gets +1 to rolls when taking morale tests."
      },
      {
        "name": "Specialist",
        "description": "Gets +1 to rolls in melee or shooting (pick one)."
      },
      {
        "name": "Resilient",
        "description": "Gets +1 to rolls when blocking hits."
      },
      {
        "name": "Elite",
        "description": "May re-roll one roll of any kind once per game."
      }
    ],
    heroes: [
      {
        name: "Captain",
        traits: [
          {
            name: "Leader",
            description: "Friendly units within 6” get +1 to morale tests."
          },
          {
            name: "Instigator",
            description: "Friendly units within 6” get +1 to melee."
          },
          {
            name: "Tactician",
            description: "Friendly units within 6” get +1 to shooting."
          }
        ]
      },
      {
        name: "Support",
        traits: [
          {
            name: "Vanguard",
            description: "Friendly units within 6” get +1 to morale tests."
          },
          {
            name: "Scavenger",
            description: "Friendly units within 6” get +1 to melee."
          },
          {
            name: "Mastermind",
            description: "Friendly units within 6” get +1 to shooting."
          }
        ]
      },
      {
        name: "Fighter",
        traits: [
          {
            name: "Duellist",
            description: "Friendly units within 6” get +1 to morale tests."
          },
          {
            name: "Fanatic",
            description: "Friendly units within 6” get +1 to melee."
          },
          {
            name: "Berserker",
            description: "Friendly units within 6” get +1 to shooting."
          }
        ]
      }
    ]
  }
};

export function getTraitDefinitions(gameSystem: string): ITrait[] {
  return traitDefinitions[gameSystem];
}

// Action creators are generated for each case reducer function
export const { initialiseCampaign, loadCampaign, adjustXp, toggleTrait } = campaignSlice.actions;

export default campaignSlice.reducer;
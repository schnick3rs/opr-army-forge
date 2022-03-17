import { ListState } from "./listSlice";

export interface ISaveData {
  armyId?: string;
  armyFile?: string;
  gameSystem: string;
  armyName: string;
  modified: string;
  listPoints: number;
  list: ISavedListState;
  saveVersion: number;
}

export interface ISavedListState extends Omit<ListState, 'units'> {
  units: ISavedUnit[];
}

export interface ISavedUnit extends IUnitSelectionData {
  id: string;
  equipment: { id: string, count: number }[];
}

export interface ISpecialRule {
  key: string;
  name: string;
  rating: string;
  condition?: string;
  modify?: boolean;
}

export interface IUnit {
  id: string;
  category?: string;
  name: string;
  size: number;
  cost: number;
  quality: string;
  defense: string;
  specialRules?: ISpecialRule[];
  upgrades: string[];
  equipment: IUpgradeGains[];// IUpgradeGainsWeapon[]; //IEquipment[];
  disabledUpgradeSections: string[];
}

export interface IUnitSelectionData {
  selectionId: string;
  customName?: string;
  selectedUpgrades: IUpgradeOption[];
  combined: boolean;
  joinToUnit?: string;
}

export interface ISelectedUnit extends IUnit, IUnitSelectionData { }

type UpgradeType = "replace" | "upgrade" | "upgradeRule" | "attachment";

export interface IUpgrade {
  id: string;
  label?: string;
  type: UpgradeType;
  affects?: "any" | "all" | number;
  select?: string | number;
  replaceWhat?: string[];
  model?: boolean;
  attachment?: boolean;
  attachModel?: boolean;
  options?: IUpgradeOption[];
}

export interface IUpgradeOption {
  instanceId: string;
  id: string;
  parentSectionId: string;
  cost: number;
  label: string;
  isModel?: boolean;
  gains: IUpgradeGains[];// IEquipment[] | ISpecialRule[];
  replacedWhat?: string[];
  type: "ArmyBookUpgradeOption";
}

export interface IUpgradeGains {
  id: string;
  name: string;
  label: string;
  count: number;
  originalCount: number;
  type: "ArmyBookRule" | "ArmyBookWeapon" | "ArmyBookItem" | "ArmyBookDefense" | "ArmyBookMultiWeapon"; // TODO: Add these
  dependencies?: IUpgradeDependency[];
  attacks?: number;
  specialRules?: IUpgradeGainsRule[];
}

export interface IUpgradeGainsItem extends IUpgradeGains {
  content: IUpgradeGains[];
}

export interface IUpgradeGainsWeapon extends IUpgradeGains {
  type: "ArmyBookWeapon";
  attacks: number;
  range: number;
  specialRules: IUpgradeGainsRule[];
}

export interface IUpgradeGainsMultiWeapon extends IUpgradeGains {
  type: "ArmyBookMultiWeapon";
  profiles: IUpgradeGainsWeapon[];
}

export interface IUpgradeGainsRule extends IUpgradeGains {
  type: "ArmyBookRule" | "ArmyBookDefense";
  key: string;
  condition: string;
  modify: boolean; // ?
  rating: string;
}

export interface IUpgradePackage {
  hint: string,
  uid: string;
  sections: IUpgrade[];
}

export interface IUpgradeDependency {
  upgradeInstanceId: string;
  count: number;
  type: UpgradeType;
}

import { Dispatch } from "react";
import { ArmyState, loadArmyData, setGameSystem } from "../data/armySlice";
import { ISaveData, ISavedListState, ISelectedUnit, ISpecialRule, IUnit, IUpgradeGainsWeapon } from "../data/interfaces";
import { ListState, loadSavedList } from "../data/listSlice";
import { groupBy } from "./Helpers";
import RulesService from "./RulesService";
import UnitService from "./UnitService";
import UpgradeService from "./UpgradeService";
import WebappApiService from "./WebappApiService";

export default class PersistenceService {

  private static prefix = "AF_Save_";

  private static getSaveKey(list: ISavedListState) {
    return this.prefix + list.creationTime;
  }

  public static saveImport(saveName: any, json: string) {
    localStorage[this.prefix + saveName] = json;
  }

  public static createSave(army: ArmyState, name: string, existingList?: ListState): string {

    const creationTime = new Date().getTime().toString();
    const list: ListState = existingList
      ? {
        ...existingList,
        creationTime: creationTime,
        undoUnitRemove: null
      }
      : {
        creationTime: creationTime,
        name: name,
        units: [],
        points: 0,
        undoUnitRemove: null
      };

    const saveData: ISaveData = {
      gameSystem: army.gameSystem,
      armyId: army.data.uid,
      armyFile: army.armyFile,
      armyName: army.data.name,
      modified: new Date().toJSON(),
      saveVersion: 2,
      listPoints: 0,
      list: this.getDataForSave(list)
    };

    console.log("Creating save...", saveData);

    const json = JSON.stringify(saveData);

    localStorage[this.getSaveKey(list)] = json;

    return creationTime;
  }

  public static getDataForSave(list: ListState): ISavedListState {
    return {
      ...list,
      units: list.units.map(u => ({
        id: u.id,
        // TODO: This isn't ideal!
        equipment: u.equipment.map(e => ({
          id: e.id,
          count: e.count
        })),
        customName: u.customName,
        selectionId: u.selectionId,
        selectedUpgrades: u.selectedUpgrades,
        combined: u.combined,
        joinToUnit: u.joinToUnit
      }))
    };
  }

  public static updateSave(list: ListState) {

    const localSave = localStorage[this.getSaveKey(list)];
    if (!localSave)
      return;

    const existingSave: ISaveData = JSON.parse(localSave);
    const points: number = UpgradeService.calculateListTotal(list.units);

    const saveData: ISaveData = {
      ...existingSave,
      modified: new Date().toJSON(),
      listPoints: points,
      list: this.getDataForSave(list)
    };

    console.log("Updating save...", saveData);

    const json = JSON.stringify(saveData);

    localStorage[this.getSaveKey(list)] = json;
  }

  public static delete(list: ListState) {
    const key = Object
      .keys(localStorage)
      .find(key => key.endsWith(list.creationTime));
    delete localStorage[key];
  }

  public static buildListFromSave(savedList: ISavedListState, armyData): ListState {

    const allSections = armyData.upgradePackages.reduce((current, next) => current.concat(next.sections), []);
    const allOptions = allSections.reduce((current, next) => current.concat(next.options), []);

// TODO: Compensate for parentSectionId missing on upgrade options...

    return {
      ...savedList,
      units: savedList.units.map(u => {
        const unitDefinition: IUnit = armyData.units.find(unit => unit.id === u.id);
        return ({
          ...unitDefinition,
          ...u,
          equipment: unitDefinition.equipment.map(e => ({
            ...e,
            count: u.equipment.find(ue => ue.id === e.id)?.count ?? e.count
          })),
          selectedUpgrades: u.selectedUpgrades.map(upg => {
            const originalUpgrade = allOptions.find(opt => opt.id === upg.id);

            // TODO! Dep on schnickers api???
            return ({
              ...upg,
            });
          })
        });
      })
    };
  }

  public static async load(dispatch: Dispatch<any>, save: ISaveData, callback: (armyData: any) => void) {

    console.log("Loading save...", save);

    const loaded = data => {
      dispatch(setGameSystem(save.gameSystem));
      dispatch(loadArmyData(data));
      const list: ListState = this.buildListFromSave(save.list, data);
      dispatch(loadSavedList(list));
    };

    const data = await WebappApiService.getArmyBookData(save.armyId, save.gameSystem);

    loaded(data);
    callback(data);
  }

  public static download(list: ListState) {
    const saveData = localStorage[this.getSaveKey(list)];
    const blob = new Blob([saveData], { type: "application/json" })
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${list.name}${list.creationTime}.json`;
    document.body.appendChild(a);
    a.dispatchEvent(new MouseEvent('click'));
  }

  public static checkExists(list: ISavedListState): boolean {
    return !!localStorage[this.getSaveKey(list)];
  }

  public static copyAsText(list: ListState) {

    const lines = [
      `++ ${list.name} [${list.points}pts] ++\n`
    ];

    const getWeapons = (unit: ISelectedUnit) => {
      const equipment = unit.equipment
        .concat(UnitService.getAllUpgradeWeapons(unit) as IUpgradeGainsWeapon[])
        .filter(e => e.count > 0);

      return equipment
        .map(e => `${e.count > 1 ? `${e.count}x ` : ""}${e.label}`)
        .join(", ");
    };

    const getRules = (unit: ISelectedUnit) => {
      const rules = (unit.specialRules ?? [])
        .concat(UnitService.getAllUpgradedRules(unit));

      const ruleGroups = groupBy(rules, "name");
      const keys = Object.keys(ruleGroups);
      // Sort rules alphabetically
      keys.sort((a, b) => a.localeCompare(b));

      return keys.map(key => {

        // This has been copy/pasted from RuleList.tsx - refactor!
        const group: ISpecialRule[] = ruleGroups[key];
        const rule = group[0];
        const rating = (rule.rating == null || rule.rating == "") ? null : key === "Psychic"

          // Take Highest
          ? Math.max(...group.map(rule => parseInt(rule.rating)))
          // Sum all occurrences
          : group.reduce((total, next) => next.rating ? total + parseInt(next.rating) : total, 0);

        // Rules with ratings do not show multiple instances
        const count = rating > 0 ? 0 : group.length;

        return (count > 1 ? `${count}x ` : "") + RulesService.displayName({ ...rule, rating: rule.rating ? rating.toString() : null });
      }).join(", ");
    };

    // Unit name [size] Qua 3+ Def 4+ 123pts
    // 2x Hand Weapons, Rifle
    // Fearless
    //
    // ...
    for (let unit of list.units) {
      lines.push(`${unit.customName ?? unit.name} [${unit.size}] | Qua ${unit.quality}+ Def ${unit.defense}+ | ${UpgradeService.calculateUnitTotal(unit)}pts`);
      lines.push(getWeapons(unit));
      lines.push(getRules(unit) + "\n");
    }

    navigator.clipboard.writeText(lines.join("\n")).then(() => console.log("Copied to clipboard..."));
  }
}

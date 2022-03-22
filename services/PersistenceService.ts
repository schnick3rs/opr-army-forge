import { ConstructionOutlined } from "@mui/icons-material";
import { Dispatch } from "react";
import { ArmyState, IArmyData, loadArmyData, setGameSystem } from "../data/armySlice";
import { ISaveData, ISavedListState, ISelectedUnit, ISpecialRule, IUnit, IUpgrade, IUpgradeGains, IUpgradeGainsWeapon, IUpgradeOption } from "../data/interfaces";
import { ListState, loadSavedList } from "../data/listSlice";
import { groupBy, makeCopy } from "./Helpers";
import RulesService from "./RulesService";
import UnitService from "./UnitService";
import UpgradeService from "./UpgradeService";
import WebappApiService from "./WebappApiService";

export default class PersistenceService {

  private static prefix = "AF_Save_";

  private static getSaveKey(creationTime: string) {
    return this.prefix + creationTime;
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
      saveVersion: 3,
      listPoints: 0,
      list: this.getDataForSave(list)
    };

    console.log("Creating save...", saveData);

    const json = JSON.stringify(saveData);

    localStorage[this.getSaveKey(list.creationTime)] = json;

    return creationTime;
  }

  public static getDataForSave(list: ListState): ISavedListState {
    return {
      ...list,
      units: list.units.map(u => ({
        id: u.id,
        customName: u.customName,
        selectionId: u.selectionId,
        selectedUpgrades: u.selectedUpgrades.map(x => ({
          instanceId: x.instanceId,
          upgradeId: x.upgrade.uid,
          optionId: x.option.id
        })),
        combined: u.combined,
        joinToUnit: u.joinToUnit
      }))
    };
  }

  public static updateSave(list: ListState) {

    const key = this.getSaveKey(list.creationTime);
    const localSave = localStorage[key];
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

    localStorage[key] = JSON.stringify(saveData);
  }

  public static delete(list: ListState) {
    const key = Object
      .keys(localStorage)
      .find(key => key.endsWith(list.creationTime));
    delete localStorage[key];
  }

  public static buildListFromSave(save: ISaveData, armyData: IArmyData): ListState {

    return save.saveVersion === 3
      ? this.buildListFromSave_v3(save.list, armyData)
      : save.saveVersion === 2
        ? this.buildListFromSave_v2(save.list, armyData)
        : null;
  }

  public static buildListFromSave_v2(savedList: ISavedListState, armyData: IArmyData): ListState {

    const allSections = armyData
      .upgradePackages
      .reduce<IUpgrade[]>((current, pkg) => current.concat(pkg.sections), []);
    const allOptions = allSections
      .reduce<IUpgradeOption[]>((current, section) => current.concat(section.options), []);

    return {
      ...savedList,
      units: savedList.units.map(u => {
        const unitDefinition: IUnit = armyData.units.find(unit => unit.id === u.id);
        const unit: ISelectedUnit = {
          ...unitDefinition,
          ...u,
          equipment: makeCopy(unitDefinition.equipment),
          selectedUpgrades: [],
          loadout: []
        };
        console.log("Unit", unit);
        // Cast to convince TS that it is indeed in the old format...
        const selectedUpgrades: any = u.selectedUpgrades;
        for (let upg of (selectedUpgrades as { id: string }[])) {
          const option = allOptions.find(opt => opt.id === upg.id);
          const section = allSections.find(sec => sec.uid === option.parentSectionId);
          UpgradeService.apply(unit, section, option);
        }
        return UpgradeService.buildUpgrades(unit);
      })
    };
  }

  public static buildListFromSave_v3(savedList: ISavedListState, armyData: IArmyData): ListState {

    const allSections = armyData
      .upgradePackages
      .reduce<IUpgrade[]>((current, pkg) => current.concat(pkg.sections), []);

    return {
      ...savedList,
      units: savedList.units.map(u => {
        const unitDefinition: IUnit = armyData.units.find(unit => unit.id === u.id);
        const unit: ISelectedUnit = {
          ...unitDefinition,
          ...u,
          equipment: makeCopy(unitDefinition.equipment),
          selectedUpgrades: [],
          loadout: []
        };

        for (let upg of u.selectedUpgrades) {
          const section = allSections.find(sec => sec.uid === upg.upgradeId);
          const option = section.options.find(opt => opt.id === upg.optionId);
          UpgradeService.apply(unit, section, option);
        }
        return UpgradeService.buildUpgrades(unit);
      })
    };
  }

  public static async load(dispatch: Dispatch<any>, save: ISaveData, callback: (armyData: any) => void) {

    console.log("Loading save...", save);

    const loaded = data => {
      dispatch(setGameSystem(save.gameSystem));
      dispatch(loadArmyData(data));
      const list: ListState = this.buildListFromSave(save, data);
      dispatch(loadSavedList(list));
    };

    const data = await WebappApiService
      .getArmyBookData(save.armyId.replace("-skirmish", ""), save.gameSystem);

    loaded(data);
    callback(data);
  }

  public static download(list: ListState) {
    const saveData = localStorage[this.getSaveKey(list.creationTime)];
    const blob = new Blob([saveData], { type: "application/json" })
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${list.name}${list.creationTime}.json`;
    document.body.appendChild(a);
    a.dispatchEvent(new MouseEvent('click'));
  }

  public static checkExists(list: ISavedListState): boolean {
    return !!localStorage[this.getSaveKey(list.creationTime)];
  }

  public static getListAsText(list: ListState) {

    const lines = [
      `++ ${list.name} [${list.points}pts] ++\n`
    ];

    const constructLabel = (item: IUpgradeGainsWeapon) => {
      const count = item.count > 1 ? `${item.count}x ` : "";
      const range = item.range ? `${item.range}", ` : "";
      const attacks = item.attacks ? `A${item.attacks}` : ""
      const rules = item.specialRules?.map(RulesService.displayName).join(", ");

      if (!range && !attacks && !rules)
        return `${count}${item.name}`;

      return `${count}${item.name} (${range}${attacks}${rules?.length > 0 ? (", " + rules) : ""})`;
    };

    const getWeapons = (unit: ISelectedUnit) => {
      console.log("Loadout", unit.loadout);
      return unit.loadout
        .map(constructLabel)
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
    for (let unit of list.units.filter(u => u.selectionId !== "dummy")) {
      lines.push(`${unit.customName ?? unit.name} [${unit.size}] | Qua ${unit.quality}+ Def ${unit.defense}+ | ${UpgradeService.calculateUnitTotal(unit)}pts`);
      lines.push(getWeapons(unit));
      lines.push(getRules(unit) + "\n");
    }

    return lines.join("\n");
  }

  public static copyAsText(list: ListState) {

    navigator
      .clipboard
      .writeText(this.getListAsText(list))
      .then(() => console.log("Copied to clipboard..."));
  }
}

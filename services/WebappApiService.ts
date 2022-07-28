import router from "next/router";
import { IArmyData } from "../data/armySlice";
import { gameSystemToEnum } from "./Helpers";
import UnitService from "./UnitService";

export default class WebappApiService {

  private static webCompanionUrl = "https://webapp.onepagerules.com/api";

  private static getUrl() {
    const fromQuery = router.query.dataSourceUrl;
    if (fromQuery) return `https://${fromQuery}.herokuapp.com/api`;

    //return "http://localhost:3000/api";

    return this.webCompanionUrl;
  }

  private static cacheResponse(key: string, res: any) {
    localStorage[key] = JSON.stringify({
      cached: new Date(),
      res
    });
  }

  private static getFromCache(key: string) {
    const cachedValue = localStorage[key];
    if (!cachedValue) return null;
    const cachedObject = JSON.parse(cachedValue);
    return cachedObject.res;
  }

  public static async getArmyBooks(gameSystemSlug: string) {
    const cacheKey = "AF_Cache_army-books-" + gameSystemSlug;
    try {
      const res = await fetch(this.getUrl() + "/army-books?gameSystemSlug=" + gameSystemSlug);
      const data = await res.json();
      this.cacheResponse(cacheKey, data);
      return data;
    }
    catch (e) {
      return this.getFromCache(cacheKey);
    }
  }

  public static async getGameRules(gameSystemSlug: string) {

    const cacheKey = "AF_Cache_game-rules-" + gameSystemSlug;
    try {
      const res = await fetch(this.getUrl() + `/content/game-systems/${gameSystemSlug}/special-rules`);
      const data = await res.json();
      this.cacheResponse(cacheKey, data);
      return data;
    }
    catch (e) {
      return this.getFromCache(cacheKey);
    }
  }

  public static async getArmyBookData(armyId: string, gameSystem: string) {

    const cacheKey = "AF_Cache_army-" + armyId + gameSystem;
    try {
      const gameSystemId = gameSystemToEnum(gameSystem);

      const armyBookRes = await fetch(this.getUrl() + `/army-books/${armyId}~${gameSystemId}?armyForge=true`);

      const data: IArmyData = await armyBookRes.json();

      const transformedData: IArmyData = this.transformArmyBookData(data, armyId);

      this.cacheResponse(cacheKey, transformedData);

      return transformedData;
    }
    catch (e) {
      return this.getFromCache(cacheKey);
    }
  };

  public static transformArmyBookData(data: any, armyId: string) {

    const upgradePackages = data.upgradePackages.map(upgradePackage => ({
      ...upgradePackage,
      sections: upgradePackage.sections.map(section => ({
        ...section,
        isCommandGroup: section.options
          .some(opt => opt.gains.some(g => g.name.toLocaleLowerCase() === "musician")),
        options: section.options.map(option => {
          const result: any = {
            ...option,
            parentSectionId: section.uid
          };
          delete result.proposedCost;
          delete result.proposedCostHint;
          delete result.proposedVersion;
          delete result.parentPackageUid;
          delete result.parentSectionUid;
          return result;
        })
      }))
    }));

    const transformedData: IArmyData = {
      ...data,
      units: data.units.map((unit, index) => ({
        ...unit,
        armyId: armyId,
        selectedUpgrades: [],
        sortId: index,
        disabledUpgradeSections: UnitService.getDisabledUpgradeSections(unit, upgradePackages)
      })),
      upgradePackages: upgradePackages
    };

    return transformedData;
  }
}
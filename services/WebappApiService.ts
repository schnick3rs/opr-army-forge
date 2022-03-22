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

  public static async getArmyBooks(gameSystemSlug: string) {
    const res = await fetch(this.getUrl() + "/army-books?gameSystemSlug=" + gameSystemSlug);
    const data = await res.json();
    return data;
  }

  public static async getArmyBookData(armyId: string, gameSystem: string) {

    const gameSystemId = gameSystemToEnum(gameSystem);

    const armyBookRes = await fetch(this.getUrl() + `/army-books/${armyId}~${gameSystemId}?armyForge=true`);

    const data: IArmyData = await armyBookRes.json();

    const upgradePackages = data.upgradePackages.map(upgradePackage => ({
      ...upgradePackage,
      sections: upgradePackage.sections.map(section => ({
        ...section,
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
        sortId: index,
        disabledUpgradeSections: UnitService.getDisabledUpgradeSections(unit, upgradePackages)
      })),
      upgradePackages: upgradePackages
    };

    return transformedData;
  };
}
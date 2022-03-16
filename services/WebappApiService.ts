import router from "next/router";
import { IArmyData } from "../data/armySlice";

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
    console.log("Army books", data);
    return data;
  }

  public static async getArmyBookData(armyId: string, gameSystem: string) {

    const gameSystemId = (() => {
      switch (gameSystem) {
        case "gf": return 2;
        case "gff": return 3;
        case "aof": return 4;
        case "aofs": return 5;
        case "aofr": return 6;
      }
    })();

    const armyBookRes = await fetch(this.getUrl() + `/army-books/${armyId}~${gameSystemId}?armyForge=true`);

    const data: IArmyData = await armyBookRes.json();


    const transformedData: IArmyData = {
      ...data,
      upgradePackages: data.upgradePackages.map(upgradePackage => ({
        ...upgradePackage,
        sections: upgradePackage.sections.map(section => ({
          ...section,
          options: section.options.map(option => {
            const result: any = {
              ...option,
              parentSectionId: section.id
            };
            delete result.proposedCost;
            delete result.proposedCostHint;
            delete result.proposedVersion;
            delete result.parentPackageUid;
            delete result.parentSectionUid;
            return result;
          })
        }))
      }))
    };

    console.log("Army data", transformedData);

    return transformedData;
  };
}
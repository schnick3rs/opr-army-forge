import router from "next/router";

export default class WebappApiService {

  private static webCompanionUrl = "https://webapp.onepagerules.com/api";

  private static getUrl() {
    const fromQuery = router.query.dataSourceUrl;
    if (fromQuery) return `https://${fromQuery}.herokuapp.com/api`;

    return "http://localhost:3000/api";

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

    const data = await armyBookRes.json();
    console.log("Army data", data);

    return data;
  };
}
import { ISpecialRule, IUpgradeGainsRule } from '../data/interfaces';

export default class DataParsingService {

  public static parseRule(r): ISpecialRule | IUpgradeGainsRule {
    const defenseMatch = /^(Defense) \+(\d+)\s?(in melee)?/.exec(r);
    if (defenseMatch) {
      return {
        key: defenseMatch[1].toLowerCase().replace(/\s+/g, "-"),
        name: defenseMatch[1],
        rating: defenseMatch[2] || "",
        condition: defenseMatch[3] || ""
      }
    }
    const rMatch = /^(.+?)(?:\((\+?)(\d+)\))?( in melee)?$/.exec(r);
    const result = {
      key: rMatch[1].toLowerCase().replace(/\s+/g, "-"),
      name: rMatch[1],
      rating: rMatch[3] || "",
      modify: rMatch[2] === "+",
      condition: rMatch[4] ? rMatch[4].trim() : null
    };
    if (!result.condition)
      delete result.condition;
    return result;
  }

}
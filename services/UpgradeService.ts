import { IEquipment, ISelectedUnit, ISpecialRule, IUpgrade, IUpgradeOption } from "../data/interfaces";
import EquipmentService from "./EquipmentService";
import "../extensions";
import DataParsingService from "./DataParsingService";
import RulesService from "./RulesService";

export default class UpgradeService {
    static calculateListTotal(list: ISelectedUnit[]) {
        return list
            .reduce((value, current) => value + UpgradeService.calculateUnitTotal(current), 0);
    }

    static calculateUnitTotal(unit: ISelectedUnit) {
        let cost = unit.cost;
        for (const equipment of unit.selectedEquipment) {
            if (equipment.cost)
                cost += equipment.cost * equipment.count;
        }
        return cost;
    }

    public static isApplied(unit: ISelectedUnit, upgrade: IUpgrade, option: IUpgradeOption): boolean {

        return unit.selectedUpgrades.contains(u => u.id === option.id);
    }

    public static countApplied(unit: ISelectedUnit, upgrade: IUpgrade, option: IUpgradeOption): number {
        return unit.selectedUpgrades.filter(u => u.id === option.id).length;
    }

    public static isValid(unit: ISelectedUnit, upgrade: IUpgrade, option: IUpgradeOption): boolean {

        if (upgrade.type === "replace") {

            const replaceCount = typeof (upgrade.affects) === "number"
                ? upgrade.affects
                : upgrade.affects === "all"
                    ? unit.size || 1 // All in unit
                    : 1;

            const toReplace = EquipmentService.findLast(unit.selectedEquipment, upgrade.replaceWhat as string);

            const alreadySelected = upgrade
                .options
                .reduce((prev, curr) => prev + (EquipmentService.findLast(unit.selectedEquipment, curr.name)?.count || 0), 0);

            if (!toReplace)
                return false;

            // "Replace any [weapon]"
            if (upgrade.affects === "any") {

                if (toReplace.count <= 0)
                    return false;
            }
            if (typeof (upgrade.select) === "number") {
                if (alreadySelected >= upgrade.select)
                    return false;
            }
        }

        if (upgrade.type === "upgrade") {

            // TODO: Check this against multiple equipments with same name?
            const selections = unit
                .selectedEquipment
                .filter(selected => upgrade.options.findIndex(opt => opt.name === selected.name) > -1);

            const countSelected = selections.reduce((prev, next) => prev + next.count || 1, 0);

            if (typeof (upgrade.select) === "number") {

                if (countSelected >= upgrade.select) {
                    return false;
                }
            }
            else if (countSelected >= unit.size) {
                return false;
            }
        }

        return true;
    };

    public static getControlType(unit: ISelectedUnit, upgrade: IUpgrade): "check" | "radio" | "updown" {
        if (upgrade.type === "upgrade") {

            // "Upgrade any model with:"
            if (upgrade.affects === "any" && unit?.size > 1)
                return "updown";

            // "Upgrade with one:"
            if (upgrade.select === 1)
                return "radio";

            // Select > 1
            if (typeof (upgrade.select) === "number")
                return "updown";

            return "check";
        }

        // "Upgrade Psychic(1):"
        if (upgrade.type === "upgradeRule") {
            return "check";
        }

        if (upgrade.type === "replace") {

            // "Replace [weapon]:"
            if (!upgrade.affects) {
                if (typeof (upgrade.select) === "number")
                    return "updown";
                return "radio";
            }
            // "Replace one [weapon]:"
            // "Replace all [weapons]:"
            if (upgrade.affects === 1 || upgrade.affects === "all") {
                return "radio";
            }
            // "Replace any [weapon]:"
            // "Replace 2 [weapons]:"
            if (upgrade.affects === "any" || typeof (upgrade.affects) === "number") {
                return "updown";
            }

        }

        console.error("No control type for: ", upgrade);

        return "updown";
    }

    public static apply(unit: ISelectedUnit, upgrade: IUpgrade, option: IUpgradeOption) {



        const count = (typeof (upgrade.affects) === "number"
            ? upgrade.affects
            : upgrade.affects === "all"
                ? unit.size || 1 // All in unit
                : 1); // TODO: Add back multiple count weapons? * (option.count || 1);

        const apply = () => {
            unit.selectedUpgrades.push(option);
        };

        if (upgrade.type === "upgradeRule") {

            // TODO: Refactor this - shouldn't be using display name func to compare probably!
            const existingRuleIndex = unit
                .specialRules
                .findIndex(r => RulesService.displayName(r) === (upgrade.replaceWhat as string));

            // Remove existing rule
            if (existingRuleIndex > -1)
                unit.specialRules.splice(existingRuleIndex, 1);

            apply();

            // Add new rule(s)!
            //unit.specialRules = unit.specialRules.concat(option.gains as ISpecialRule[]);

            return;
        }
        else if (upgrade.type === "upgrade") {

            apply();
        }
        else if (upgrade.type === "replace") {

            console.log("Replace " + count);

            const replaceWhat: string[] = typeof (upgrade.replaceWhat) === "string"
                ? [upgrade.replaceWhat]
                : upgrade.replaceWhat;

            for (let what of replaceWhat) {

                // Try and find item to replace...
                const replaceIndex = EquipmentService.findLastIndex(unit.selectedEquipment, what);
                const toReplace = unit.selectedEquipment[replaceIndex];

                // Couldn't find the item to replace
                if (!toReplace) {
                    console.error(`Cannot find ${upgrade.replaceWhat} to replace!`);
                    return;
                }

                console.log("Replacing... ", toReplace);

                // Decrement the count of the item being replaced
                toReplace.count -= count;

                // TODO: Use Math.max... ?
                if (toReplace.count <= 0)
                    toReplace.count = 0;
                //     unit.selectedEquipment.splice(replaceIndex, 1);
            }

            apply();
        }
    }

    public static remove(unit: ISelectedUnit, upgrade: IUpgrade, option: IUpgradeOption) {

        const count = (typeof (upgrade.affects) === "number"
            ? upgrade.affects
            : upgrade.affects === "all"
                ? unit.size || 1 // All in unit
                : 1);// TODO: Fix count for WC data * (option.count || 1);

        const removeAt = unit.selectedUpgrades.findLastIndex(u => u.id === option.id);
        unit.selectedUpgrades.splice(removeAt, 1);

        if (upgrade.type === "upgradeRule") {

            // Remove upgrades rule(s)
            // for (let i = unit.specialRules.length - 1; i >= 0; i--)
            //     if (option.specialRules.indexOf(unit.specialRules[i]) >= 0)
            //         unit.specialRules.splice(i, 1);

            // Re-add original rule
            unit.specialRules.push(DataParsingService.parseRule(upgrade.replaceWhat as string));

            return;
        }



        // for (let e of option.gains) {
        //     const selection = EquipmentService.findLast(unit.selectedEquipment, e.name);

        //     // If multiple selections
        //     if (selection.count) {
        //         selection.count -= count;
        //     }

        //     if (selection.count <= 0) {
        //         // Remove the upgrade from the list
        //         const removeIndex = EquipmentService.findLastIndex(unit.selectedEquipment, e.name)
        //         unit.selectedEquipment.splice(removeIndex, 1);
        //     }
        // }

        if (upgrade.type === "replace") {

            const replaceWhat: string[] = typeof (upgrade.replaceWhat) === "string"
                ? [upgrade.replaceWhat]
                : upgrade.replaceWhat;

            for (let what of replaceWhat) {

                const current = EquipmentService.findLast(unit.selectedEquipment, what);

                if (current) {

                    current.count += count;

                } else {

                    const original = EquipmentService.findLast(unit.equipment, what);

                    // put the original item back
                    unit.selectedEquipment.push({ ...original, count: original.count || unit.size });
                }
            }
        }
    }
}
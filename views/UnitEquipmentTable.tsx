import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  ISelectedUnit,
  IUpgradeGains,
  IUpgradeGainsItem,
  IUpgradeGainsRule,
  IUpgradeGainsWeapon,
} from "../data/interfaces";
import EquipmentService from "../services/EquipmentService";
import pluralise from "pluralize";
import RuleList from "./components/RuleList";
import { Fragment } from "react";
import _ from "lodash";
import DataParsingService from "../services/DataParsingService";

export default function UnitEquipmentTable({
  unit,
  square,
}: {
  unit: ISelectedUnit;
  square: boolean;
}) {
  const isWeapon = (e) => e.attacks;

  const weaponsFromItems = _.flatMap(
    unit.loadout.filter((e) => e.type === "ArmyBookItem"),
    (e) =>
      (e as IUpgradeGainsItem).content.filter(
        (item) => item.type === "ArmyBookWeapon"
      )
  );
  const weapons = unit.loadout
    .filter((e) => isWeapon(e))
    .concat(
      weaponsFromItems.map((item) => ({ ...item, count: item.count ?? 1 }))
    );
  
  const equipment = unit.loadout.filter((e) => !isWeapon(e));
  const combinedEquipment = equipment.map((e) => {
    if (e.type === "ArmyBookItem")
      return {
        label: e.name,
        specialRules: (e as IUpgradeGainsItem).content.filter(
          (c) => c.type === "ArmyBookRule" || c.type === "ArmyBookDefense"
        ) as IUpgradeGainsRule[],
      };

    return {
      label: e.label || e.name,
      specialRules: e.specialRules.map(DataParsingService.parseRule),
    };
  });

  const hasWeapons = weapons.length > 0;
  const hasEquipment = equipment.length > 0; // || itemUpgrades.length > 0;

  const weaponGroups = _.groupBy(
    weapons,
    (w) => pluralise.singular(w.name ?? w.label) + w.attacks
  );
  const itemGroups = _.groupBy(combinedEquipment, (w) =>
    pluralise.singular(w.name ?? w.label)
  );

  const cellStyle = {
    paddingLeft: "8px",
    paddingRight: "8px",
    borderBottom: "none",
  };
  const headerStyle = { ...cellStyle, fontWeight: 600, paddingTop: "2px", paddingBottom: "2px" };

  return (
    <>
      {hasWeapons && (
        <TableContainer
          component={Paper}
          square={square}
          elevation={0}
          style={{ borderBottom: "1px solid rgba(0,0,0,.12)" }}
        >
          <Table size="small">
            <TableHead>
              <TableRow style={{ backgroundColor: "#EBEBEB", fontWeight: 600 }}>
                <TableCell style={headerStyle}>Weapon</TableCell>
                <TableCell style={headerStyle}>RNG</TableCell>
                <TableCell style={headerStyle}>ATK</TableCell>
                <TableCell style={headerStyle}>AP</TableCell>
                <TableCell style={headerStyle}>SPE</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(weaponGroups).map((key) => {
                const group: IUpgradeGainsWeapon[] = weaponGroups[key];
                const upgrade = group[0];
                const count = group.reduce((c, next) => c + next.count, 0);
                const e = { ...upgrade, count };

                return <WeaponRow key={key} weapon={e} isProfile={false} />;
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {hasEquipment && (
        <TableContainer
          component={Paper}
          className="mt-2"
          square={square}
          elevation={0}
          style={{ borderBottom: "1px solid rgba(0,0,0,.12)" }}
        >
          <Table size="small">
            <TableHead>
              <TableRow style={{ backgroundColor: "#EBEBEB", fontWeight: 600 }}>
                <TableCell style={headerStyle}>Equipment</TableCell>
                <TableCell style={headerStyle}>SPE</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.values(itemGroups).map((group: any[], index) => {
                const e = group[0];
                const count = group.reduce(
                  (c, next) => c + (next.count || 1),
                  0
                );

                return (
                  <TableRow key={index}>
                    <TableCell style={cellStyle}>
                      {count > 1 ? `${count}x ` : ""}
                      {e.label}
                    </TableCell>
                    <TableCell style={cellStyle}>
                      <RuleList specialRules={e.specialRules} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}

export function WeaponRow({
  weapon,
  isProfile,
}: {
  weapon: IUpgradeGainsWeapon;
  isProfile: boolean;
}) {
  const count = weapon.count;
  const name =
    count > 1 ? pluralise.plural(weapon.name) : pluralise.singular(weapon.name);
  const weaponCount = count > 1 ? `${count}x ` : null;
  const rules = weapon.specialRules.filter((r) => r.name !== "AP");

  const cellStyle = { paddingLeft: "8px", paddingRight: "8px" };
  const borderStyle = {
    borderBottom: "none",
    borderTop: isProfile ? "none" : "1px solid rgb(224, 224, 224)",
  };

  return (
    <TableRow>
      <TableCell style={{ ...borderStyle, ...cellStyle, fontWeight: 600 }}>
        {weaponCount}
        {isProfile ? `- ${name}` : name}
      </TableCell>
      <TableCell style={borderStyle}>
        {weapon.range ? weapon.range + '"' : "-"}
      </TableCell>
      <TableCell style={borderStyle}>
        {weapon.attacks ? "A" + weapon.attacks : "-"}
      </TableCell>
      <TableCell style={borderStyle}>
        {EquipmentService.getAP(weapon) || "-"}
      </TableCell>
      <TableCell style={borderStyle}>
        {rules && rules.length > 0 ? (
          <RuleList specialRules={rules} />
        ) : (
          <span>-</span>
        )}
      </TableCell>
    </TableRow>
  );
}

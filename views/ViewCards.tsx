import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../data/store";
import style from "../styles/Cards.module.css";
import UnitEquipmentTable from "../views/UnitEquipmentTable";
import { Paper, Card } from "@mui/material";
import RulesService from "../services/RulesService";
import { IGameRule } from "../data/armySlice";
import { groupBy, makeCopy } from "../services/Helpers";
import UnitService from "../services/UnitService";
import UpgradeService from "../services/UpgradeService";
import _ from "lodash";
import { ISelectedUnit, IUpgradeGainsItem, IUpgradeGainsRule } from "../data/interfaces";
import RuleList from "./components/RuleList";
import { IViewPreferences } from "../pages/view";

interface ViewCardsProps {
  prefs: IViewPreferences;
}

export default function ViewCards({ prefs }: ViewCardsProps) {
  const list = useSelector((state: RootState) => state.list);
  const army = useSelector((state: RootState) => state.army);

  const gameRules = army.rules;
  const armyRules = army.loadedArmyBooks.flatMap((x) => x.specialRules);
  const ruleDefinitions: IGameRule[] = gameRules.concat(armyRules);

  const units: ISelectedUnit[] = (list?.units ?? []).map((u) => makeCopy(u));

  const usedRules = [];

  const unitAsKey = (unit: ISelectedUnit) => {
    return {
      id: unit.id,
      // upgrades: unit.selectedUpgrades.map((x) => ({
      //   sectionId: x.upgrade.uid,
      //   optionId: x.option.id,
      // })),
      loadout: unit.loadout.map((x) => ({
        id: x.id,
        count: x.count,
      })),
    };
  };

  const getAttachedUnit = (u: ISelectedUnit) =>
    units.find((x) => x.joinToUnit === u.selectionId && x.combined);

  const viewUnits = units
    .filter((u) => !u.combined || !u.joinToUnit)
    .map((u) => (u.combined ? UnitService.mergeCombinedUnit(u, getAttachedUnit(u)) : u));

  console.log(viewUnits);

  const unitGroups = _.groupBy(viewUnits, (u) => JSON.stringify(unitAsKey(u)));

  const getUnitCard = (unit: ISelectedUnit, unitCount: number) => {
    const rules = getRules(unit);
    usedRules.push(...rules.keys);
    usedRules.push(...rules.weaponRules.map((r) => r.name));
    return (
      <UnitCard
        rules={rules}
        unit={unit}
        count={unitCount}
        prefs={prefs}
        ruleDefinitions={ruleDefinitions}
      />
    );
  };

  return (
    <div className="mx-4">
      <div className={style.grid}>
        {prefs.combineSameUnits
          ? Object.values(unitGroups).map((grp: ISelectedUnit[], i) => {
              const unit = grp[0];
              const count = grp.length;
              return getUnitCard(unit, count);
            })
          : units.map((unit, i) => getUnitCard(unit, 1))}
        {prefs.showPsychic && <PsychicCard army={army} />}
      </div>
      {!prefs.showFullRules && (
        <SpecialRulesCard usedRules={usedRules} ruleDefinitions={ruleDefinitions} />
      )}
    </div>
  );
}

interface UnitCardProps {
  unit: ISelectedUnit;
  rules: any;
  count: number;
  prefs: IViewPreferences;
  ruleDefinitions: any;
}

function UnitCard({ unit, rules, count, prefs, ruleDefinitions }: UnitCardProps) {
  const toughness = toughFromUnit(unit);

  const unitRules = unit.specialRules
    .filter((r) => r.name != "-")
    .concat(UnitService.getUpgradeRules(unit));
  const items = unit.loadout.filter(x => x.type === "ArmyBookItem");
  console.log("unit loadout", unit.loadout);
  console.log("unit rules", unitRules);
  console.log("rulesFromUpgrades", items);

  const stats = (
    <div className="is-flex mb-3" style={{ justifyContent: "center" }}>
      <div className={style.profileStat2}>
        <p>Quality</p>
        <div className="stat-break"></div>
        <p>{unit.quality}+</p>
      </div>
      <div className={style.profileStat2}>
        <p>Defense</p>
        <div className="stat-break"></div>
        <p>{unit.defense}+</p>
      </div>
      {toughness > 1 && (
        <div className={style.profileStat2}>
          <p>Tough</p>
          <div className="stat-break"></div>
          <p>{toughness}</p>
        </div>
      )}
    </div>
  );

  const ruleGroups = _.groupBy(unitRules, (x) => x.name);
  const ruleKeys = Object.keys(ruleGroups);
  const itemGroups = _.groupBy(items, (x) => x.name);
  const itemKeys = Object.keys(itemGroups);

  const rulesSection = unitRules?.length > 0 && (
    <div className="px-2 mb-4" style={{ fontSize: "14px" }}>
      {ruleKeys.map((key, index) => {
        const group = ruleGroups[key];

        if (!prefs.showFullRules)
          return (
            <span key={index}>
              {index === 0 ? "" : ", "}
              <RuleList specialRules={group} />
            </span>
          );

        const rule = group[0];
        const rating = group.reduce(
          (total, next) => (next.rating ? total + parseInt(next.rating) : total),
          0
        );

        const ruleDefinition = ruleDefinitions.filter(
          (r) => /(.+?)(?:\(|$)/.exec(r.name)[0] === rule.name
        )[0];

        return (
          <p key={index}>
            <span style={{ fontWeight: 600 }}>
              {RulesService.displayName({ ...rule, rating }, count)} -
            </span>
            <span> {ruleDefinition?.description || ""}</span>
          </p>
        );
      })}
      {itemKeys.map((key, index) => {
        const group = itemGroups[key];
        const item: IUpgradeGainsItem = group[0];
        const count = group.reduce((total, x) => total + (x.count || 1), 0);

        const itemRules: IUpgradeGainsRule[] = item.content.filter(
          (x) => x.type === "ArmyBookRule"
        ) as any;
        const itemHasRules = itemRules.length > 0;
        console.log("ITEM GROUP", group);
        return (
          <span key={index}>
            {", "}
            {count > 1 ? `${count}x ` : ""}
            {item.name}
            {itemHasRules && (
              <>
                <span>(</span>
                <RuleList specialRules={itemRules} />
                <span>)</span>
              </>
            )}
          </span>
        );
      })}
    </div>
  );

  return (
    <ViewCard
      title={
        <>
          {count > 1 ? `${count}x ` : ""}
          {unit.customName || unit.name}
          <span className="" style={{ color: "#666666" }}>
            {" "}
            [{unit.size}]
          </span>
          {prefs.showPointCosts && (
            <span className="is-size-6 ml-1" style={{ color: "#666666" }}>
              - {UpgradeService.calculateUnitTotal(unit)}pts
            </span>
          )}
        </>
      }
      content={
        <>
          {stats}
          {rulesSection}
          <UnitEquipmentTable unit={unit} hideEquipment={true} square />
        </>
      }
    />
  );
}

function PsychicCard({ army }) {
  return (
    <>
      {army.loadedArmyBooks.map((book) => (
        <ViewCard
          title="Psychic/Spells"
          content={
            <>
              <hr className="my-0" />

              <Paper square elevation={0}>
                <div className="px-2 my-2">
                  {book.spells.map((spell) => (
                    <p key={spell.id}>
                      <span style={{ fontWeight: 600 }}>
                        {spell.name} ({spell.threshold}+):{" "}
                      </span>
                      <span>{spell.effect}</span>
                    </p>
                  ))}
                </div>
              </Paper>
            </>
          }
        />
      ))}
    </>
  );
}

function SpecialRulesCard({ usedRules, ruleDefinitions }) {
  return (
    <ViewCard
      title="Special Rules"
      content={
        <>
          <hr className="my-0" />
          <Paper square elevation={0}>
            <div className={`px-2 my-2 ${style.grid} has-text-left`}>
              {_.uniq(usedRules)
                .sort()
                .map((r, i) => (
                  <p key={i} style={{ breakInside: "avoid" }}>
                    <span style={{ fontWeight: 600 }}>{r} - </span>
                    <span>{ruleDefinitions.find((t) => t.name === r)?.description}</span>
                  </p>
                ))}
            </div>
          </Paper>
        </>
      }
    />
  );
}

function ViewCard({ title, content }) {
  return (
    <Card elevation={1} className={style.card}>
      <div className="card-body">
        <h3 className="is-size-5 my-2" style={{ fontWeight: 600, textAlign: "center" }}>
          {title}
        </h3>
        {content}
      </div>
    </Card>
  );
}

function getRules(unit: ISelectedUnit) {
  const unitRules = unit.specialRules.filter((r) => r.name != "-");
  const rulesFromUpgrades = UnitService.getAllUpgradedRules(unit);
  const weaponRules = UnitService.getAllEquipment(unit)
    .filter((e) => e.attacks > 0)
    .flatMap((e) => e.specialRules);

  const rules = unitRules.concat(rulesFromUpgrades).filter((r) => !!r && r.name != "-");
  const ruleGroups = groupBy(rules, "name");
  const ruleKeys = Object.keys(ruleGroups);
  return { keys: ruleKeys, groups: ruleGroups, weaponRules };
}

function toughFromUnit(unit) {
  let baseTough: number = 0;

  baseTough += unit.specialRules.reduce((tough, rule) => {
    if (rule.name === "Tough") {
      tough += parseInt(rule.rating);
    }
    return tough;
  }, 0);

  baseTough += UnitService.getAllUpgradedRules(unit).reduce((tough, { name, rating }) => {
    if (name === "Tough") {
      tough += parseInt(rating);
    }
    return tough;
  }, 0);

  return baseTough || 1;
}

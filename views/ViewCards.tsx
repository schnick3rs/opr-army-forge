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
import { ISelectedUnit } from "../data/interfaces";
import RuleList from "./components/RuleList";

export default function ViewCards({
  showPsychic,
  showFullRules,
  showPointCosts,
  combineSameUnits,
}) {
  const list = useSelector((state: RootState) => state.list);
  const army = useSelector((state: RootState) => state.army);

  const gameRules = army.rules;
  const armyRules = army.data?.specialRules;
  const spells = army.data?.spells || [];
  const ruleDefinitions: IGameRule[] = gameRules.concat(armyRules);

  const units = (list?.units ?? [])
    .filter((u) => u.selectionId !== "dummy")
    .map((u) => makeCopy(u));
  for (let unit of units) {
    delete unit.selectionId;
  }

  const usedRules = [];

  const unitAsKey = (unit: ISelectedUnit) => {
    return {
      id: unit.id,
      upgrades: unit.selectedUpgrades.map((x) => ({
        sectionId: x.upgrade.id,
        optionId: x.option.id,
      })),
    };
  };

  const unitGroups = _.groupBy(units, (u) => JSON.stringify(unitAsKey(u)));

  const getUnitCard = (unit: ISelectedUnit, unitCount: number) => {
    const rules = getRules(unit);
    usedRules.push(...rules.keys);
    usedRules.push(...rules.weaponRules.map((r) => r.name));
    return (
      <UnitCard
        rules={rules}
        unit={unit}
        count={unitCount}
        showPointCosts={showPointCosts}
        showFullRules={showFullRules}
        ruleDefinitions={ruleDefinitions}
      />
    );
  };

  return (
    <>
      <div className={style.grid}>
        {combineSameUnits
          ? Object.values(unitGroups).map((grp: ISelectedUnit[], i) => {
              const unit = grp[0];
              const count = grp.length;
              return getUnitCard(unit, count);
            })
          : units.map((unit, i) => {
              return getUnitCard(unit, 1);
            })}
        {showPsychic && (
          <div className={style.card}>
            <Card elevation={1}>
              <div className="mb-4">
                <div className="card-body">
                  <h3
                    className="is-size-4 my-2"
                    style={{ fontWeight: 500, textAlign: "center" }}
                  >
                    Psychic/Spells
                  </h3>
                  <hr className="my-0" />

                  <Paper square elevation={0}>
                    <div className="px-2 my-2">
                      {spells.map((spell) => (
                        <p key={spell.id}>
                          <span style={{ fontWeight: 600 }}>
                            {spell.name} ({spell.threshold}+):{" "}
                          </span>
                          <span>{spell.effect}</span>
                        </p>
                      ))}
                    </div>
                  </Paper>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
      {!showFullRules && (
        <div className={`mx-4 ${style.card}`}>
          <Card elevation={1}>
            <div className="mb-4">
              <div className="card-body">
                <h3
                  className="is-size-4 my-2"
                  style={{ fontWeight: 500, textAlign: "center" }}
                >
                  Special Rules
                </h3>
                <hr className="my-0" />

                <Paper square elevation={0}>
                  <div className={`px-2 my-2 ${style.grid} has-text-left`}>
                    {_.uniq(usedRules)
                      .sort()
                      .map((r, i) => (
                        <p key={i} style={{ breakInside: "avoid" }}>
                          <span style={{ fontWeight: 600 }}>{r} - </span>
                          <span>
                            {
                              ruleDefinitions.find((t) => t.name === r)
                                ?.description
                            }
                          </span>
                        </p>
                      ))}
                  </div>
                </Paper>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

function UnitCard({
  unit,
  rules,
  count,
  showPointCosts,
  showFullRules,
  ruleDefinitions,
}) {
  const toughness = toughFromUnit(unit);

  const ruleKeys = rules.keys;
  const ruleGroups = rules.groups;
  // usedRules.push(...ruleKeys);
  // usedRules.push(...weaponRules.map((r) => r.name));

  // Sort rules alphabetically
  ruleKeys.sort((a, b) => a.localeCompare(b));

  return (
    <div className={style.card}>
      <Card elevation={1}>
        <div className="card-body mb-4">
          <h3
            className="is-size-5 my-2"
            style={{ fontWeight: 500, textAlign: "center" }}
          >
            {count > 1 ? `${count}x ` : ""}
            {unit.customName || unit.name}
            <span className="" style={{ color: "#666666" }}>
              {" "}
              [{unit.size}]
            </span>
            {showPointCosts && (
              <span className="is-size-6 ml-1" style={{ color: "#666666" }}>
                - {UpgradeService.calculateUnitTotal(unit)}pts
              </span>
            )}
          </h3>
          <hr className="my-0" />

          <div className="is-flex" style={{ justifyContent: "center" }}>
            <div className={style.profileStat}>
              <p>Quality</p>
              <p>{unit.quality}+</p>
            </div>
            <div className={style.profileStat}>
              <p>Defense</p>
              <p>{unit.defense}+</p>
            </div>
            {toughness > 1 && (
              <div className={style.profileStat}>
                <p>Tough</p>
                <p>{toughness}</p>
              </div>
            )}
          </div>
          <UnitEquipmentTable unit={unit} square />
          {ruleKeys?.length > 0 && (
            <Paper square elevation={0}>
              <div className="px-2 my-2">
                {ruleKeys.map((key, index) => {
                  const group = ruleGroups[key];

                  if (!showFullRules)
                    return (
                      <span key={index} style={{ fontWeight: 600 }}>
                        {index === 0 ? "" : ", "}
                        {/* <RuleList specialRules={[{ ...rule, rating, count }]} /> */}
                        <RuleList specialRules={group} />
                      </span>
                    );

                  const rule = group[0];
                  const rating = group.reduce(
                    (total, next) =>
                      next.rating ? total + parseInt(next.rating) : total,
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
              </div>
            </Paper>
          )}
        </div>
      </Card>
    </div>
  );
}

function getRules(unit: ISelectedUnit) {
  const unitRules = (unit.specialRules || []).filter((r) => r.name != "-");

  const rulesFromUpgrades = UnitService.getAllUpgradedRules(unit);
  const weaponRules = UnitService.getAllEquipment(unit)
    .filter((e) => e.attacks > 0)
    .flatMap((e) => e.specialRules);

  const rules = unitRules
    .concat(rulesFromUpgrades)
    .filter((r) => !!r && r.name != "-");
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

  baseTough += UnitService.getAllUpgradedRules(unit).reduce(
    (tough, { name, rating }) => {
      if (name === "Tough") {
        tough += parseInt(rating);
      }
      return tough;
    },
    0
  );

  return baseTough || 1;
}

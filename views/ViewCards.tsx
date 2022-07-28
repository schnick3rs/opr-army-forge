import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../data/store";
import style from "../styles/Cards.module.css";
import UnitEquipmentTable from "../views/UnitEquipmentTable";
import { Paper, Card } from "@mui/material";
import RulesService from "../services/RulesService";
import { ArmyState, IGameRule } from "../data/armySlice";
import { groupBy, groupMap, intersperse, makeCopy } from "../services/Helpers";
import UnitService from "../services/UnitService";
import UpgradeService from "../services/UpgradeService";
import _ from "lodash";
import { ISelectedUnit, IUpgradeGainsItem, IUpgradeGainsRule } from "../data/interfaces";
import RuleList from "./components/RuleList";
import { IViewPreferences, listContainsPyschic } from "../pages/view";
import { getFlatTraitDefinitions, ITrait } from "../data/campaign";
import LinkIcon from "@mui/icons-material/Link";
import { ListState } from "../data/listSlice";

interface ViewCardsProps {
  prefs: IViewPreferences;
}

export default function ViewCards({ prefs }: ViewCardsProps) {
  const list = useSelector((state: RootState) => state.list);
  const army = useSelector((state: RootState) => state.army);

  const gameRules = army.rules;
  const armyRules = army.loadedArmyBooks.flatMap((x) => x.specialRules);
  const ruleDefinitions: IGameRule[] = gameRules.concat(armyRules);
  const traitDefinitions = getFlatTraitDefinitions();

  const units = list?.units;

  const unitGroups = UnitService.getDisplayUnits(units);

  const usedRules = [];

  const getUnitCard = (unit: ISelectedUnit, unitCount: number) => {
    const rules = getRules(unit);
    usedRules.push(...rules.keys);
    usedRules.push(...rules.weaponRules.map((r) => r.name));

    if (unit.traits?.length > 0) {
      usedRules.push(...unit.traits);
    }

    const originalUnit = units.find((x) => x.selectionId === unit.selectionId);
    const attachedUnit = units.find((x) => x.joinToUnit === unit.selectionId && x.id === unit.id);
    const originalUnitCost = UpgradeService.calculateUnitTotal(originalUnit);
    const attachedUnitCost = attachedUnit ? UpgradeService.calculateUnitTotal(attachedUnit) : 0;
    const attachedTo = units.find((x) => x.selectionId === unit.joinToUnit);

    return (
      <UnitCard
        rules={rules}
        unit={unit}
        attachedTo={attachedTo}
        pointCost={originalUnitCost + attachedUnitCost}
        count={unitCount}
        prefs={prefs}
        ruleDefinitions={ruleDefinitions}
        traitDefinitions={traitDefinitions}
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
        {prefs.showPsychic && <SpellsCard army={army} list={list} />}
      </div>
      {!prefs.showFullRules && (
        <SpecialRulesCard
          usedRules={usedRules}
          ruleDefinitions={ruleDefinitions.concat(traitDefinitions as any[])}
        />
      )}
    </div>
  );
}

interface UnitCardProps {
  unit: ISelectedUnit;
  attachedTo: ISelectedUnit;
  pointCost: number;
  rules: any;
  count: number;
  prefs: IViewPreferences;
  ruleDefinitions: any;
  traitDefinitions: ITrait[];
}

export function UnitCard({
  unit,
  attachedTo,
  pointCost,
  count,
  prefs,
  ruleDefinitions,
  traitDefinitions,
}: UnitCardProps) {
  const toughness = toughFromUnit(unit);

  const unitRules = unit.specialRules
    .filter((r) => r.name != "-")
    .concat(UnitService.getUpgradeRules(unit));
  const items = unit.loadout.filter((x) => x.type === "ArmyBookItem") as IUpgradeGainsItem[];

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

  const rulesSection = (
    <div className="px-2 mb-2" style={{ fontSize: "14px" }}>
      {prefs.showFullRules
        ? (() => {
            const itemRules = _.flatMap(
              items,
              (item) =>
                item.content.filter(
                  (x) => x.type === "ArmyBookRule" || x.type === "ArmyBookDefense"
                ) as IUpgradeGainsRule[]
            );
            return groupMap(
              unitRules.concat(itemRules),
              (x) => x.name,
              (group, key) => {
                const rule = group[0];
                const rating = group.reduce(
                  (total, next) => (next.rating ? total + parseInt(next.rating) : total),
                  0
                );

                const ruleDefinition = ruleDefinitions.filter(
                  (r) => /(.+?)(?:\(|$)/.exec(r.name)[0] === rule.name
                )[0];

                return (
                  <p key={key}>
                    <span style={{ fontWeight: 600 }}>
                      {RulesService.displayName({ ...rule, rating: rating as any }, count)} -
                    </span>
                    <span> {ruleDefinition?.description || ""}</span>
                  </p>
                );
              }
            );
          })()
        : (() => {
            const rules = groupMap(
              unitRules,
              (x) => x.name,
              (group, key) => <RuleList key={key} specialRules={group} />
            );

            const itemRules = groupMap(
              items,
              (x) => x.name,
              (group, key) => {
                const item: IUpgradeGainsItem = group[0] as IUpgradeGainsItem;
                const count = _.sumBy(group, (x) => x.count || 1);

                const itemRules: IUpgradeGainsRule[] = item.content.filter(
                  (x) => x.type === "ArmyBookRule" || x.type === "ArmyBookDefense"
                ) as any;

                const upgrade = unit.selectedUpgrades.find((x) =>
                  x.option.gains.some((y) => y.name === item.name)
                )?.upgrade;
                const itemAffectsAll = upgrade?.affects === "all";
                const hasStackableRule = itemRules.some((x) => x.name === "Impact");
                const hideCount = itemAffectsAll && !hasStackableRule;

                return (
                  <span key={key}>
                    {count > 1 && !hideCount && `${count}x `}
                    {item.name}
                    {itemRules.length > 0 && (
                      <>
                        <span>(</span>
                        <RuleList specialRules={itemRules} />
                        <span>)</span>
                      </>
                    )}
                  </span>
                );
              }
            );

            console.log(rules.concat(itemRules));
            return intersperse(rules.concat(itemRules), <span>, </span>);
          })()}
    </div>
  );

  const traitsSection = unit.traits?.length > 0 && (
    <div className="px-2 mb-4" style={{ fontSize: "14px" }}>
      {unit.traits.map((trait: string, index: number) => {
        const traitDef = traitDefinitions.find((x) => x.name === trait);
        if (!prefs.showFullRules)
          return (
            <span key={index}>
              {index === 0 ? "" : ", "}
              <RuleList specialRules={[traitDef]} />
            </span>
          );

        return (
          <p key={index}>
            <span style={{ fontWeight: 600 }}>{traitDef.name} -</span>
            <span> {traitDef.description}</span>
          </p>
        );
      })}
    </div>
  );

  const joinedUnitText = attachedTo && (
    <div className="is-flex" style={{ justifyContent: "center" }}>
      <LinkIcon />
      <p className="mb-2" style={{ textAlign: "center" }}>
        Joined to {attachedTo.customName || attachedTo.name}
      </p>
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
            [{UnitService.getSize(unit)}]
          </span>
          {prefs.showPointCosts && (
            <span className="is-size-6 ml-1" style={{ color: "#666666" }}>
              - {pointCost}pts
            </span>
          )}
        </>
      }
      content={
        <>
          {joinedUnitText}
          {stats}
          {rulesSection}
          {traitsSection}
          <div className="mt-4">
            <UnitEquipmentTable loadout={unit.loadout} hideEquipment square />
          </div>
          {unit.notes && <div className="p-2">{unit.notes}</div>}
        </>
      }
    />
  );
}

interface SpellsCardProps {
  army: ArmyState;
  list: ListState;
}

export function SpellsCard({ army, list }: SpellsCardProps) {
  const isGrimdark = army.gameSystem.startsWith("gf");
  return (
    <>
      {army.loadedArmyBooks.map((book) => {
        const enable = listContainsPyschic(list.units.filter((x) => x.armyId === book.uid));
        return (
          enable && (
            <ViewCard
              key={book.uid}
              title={`${book.name} ${isGrimdark ? "Psychic " : ""} Spells`}
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
          )
        );
      })}
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
                    <span style={{ fontWeight: 600 }}>{r + " - "}</span>
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

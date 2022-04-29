import RuleItem from "./RuleItem";
import { RootState } from "../../data/store";
import { useSelector } from "react-redux";
import { IGameRule } from "../../data/armySlice";
import { Fragment, memo } from "react";
import { IGroupedRule, ISpecialRule } from "../../data/interfaces";
import RulesService from "../../services/RulesService";
import { groupBy } from "../../services/Helpers";

interface GroupedRuleListProps {
  groupedRules: IGroupedRule[];
}

export default function GroupedRuleList({ groupedRules }: GroupedRuleListProps) {
  const army = useSelector((state: RootState) => state.army);
  const gameRules = army.rules;
  const armyRules = army.loadedArmyBooks.flatMap((x) => x.specialRules);
  const ruleDefinitions: IGameRule[] = gameRules.concat(armyRules);

  if (!groupedRules || groupedRules.length === 0) return null;

  return (
    <>
      {groupedRules.map((groupedRule, index) => {
        const key = groupedRule.key;
        const rule = groupedRule.group[0];
        const rating =
          rule.rating == null || rule.rating == ""
            ? null
            : key === "Psychic"
            ? // Take Highest
              Math.max(...groupedRule.group.map((rule) => parseInt(rule.rating)))
            : // Sum all occurrences
              groupedRule.group.reduce(
                (total, next) => (next.rating ? total + parseInt(next.rating) : total),
                0
              );

        // Rules with ratings do not show multiple instances
        const count = rating > 0 ? 0 : groupedRule.count;

        //console.log(rule)
        const ruleDefinition = ruleDefinitions.filter(
          (r) => /(.+?)(?:\(|$)/.exec(r.name)[0] === rule.name
        )[0];
        return (
          <Fragment key={index}>
            {index > 0 ? <span className="mr-1">, </span> : null}
            <RuleItem
              label={
                (count > 1 ? `${count}x ` : "") +
                RulesService.displayName({
                  ...rule,
                  rating: rule.rating ? rating.toString() : null,
                })
              }
              description={ruleDefinition?.description || ""}
            />
          </Fragment>
        );
      })}
    </>
  );
}

//export const MemoisedRuleList = memo(RuleList);

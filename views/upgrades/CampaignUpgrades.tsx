import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  Checkbox,
  Divider,
} from "@mui/material";
import { IconButton } from "@mui/material";
import DownIcon from "@mui/icons-material/KeyboardArrowDown";
import UpIcon from "@mui/icons-material/KeyboardArrowUp";
import { ISelectedUnit } from "../../data/interfaces";
import { useDispatch } from "react-redux";
import { Fragment } from "react";
import { getTraitDefinitions, ISkillSet, ITrait } from "../../data/campaign";
import { adjustXp, toggleTrait } from "../../data/listSlice";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RuleList from "../components/RuleList";

interface CampaignUpgradesProps {
  unit: ISelectedUnit;
  gameSystem: string;
}

export default function CampaignUpgrades({ unit, gameSystem }: CampaignUpgradesProps) {
  const dispatch = useDispatch();

  const isHero = unit.specialRules.some((r) => r.name === "Hero");
  const allTraitDefinitions = getTraitDefinitions(gameSystem);
  const traitDefinitions = allTraitDefinitions[isHero ? "heroes" : "units"];
  const injuryDefinitions = allTraitDefinitions["injuries"];
  const talentDefinitions = allTraitDefinitions["talents"];

  const adjustUnitXp = (xp: number) => {
    dispatch(adjustXp({ unitId: unit.selectionId, xp }));
  };

  const toggleUnitTrait = (trait: ITrait) => {
    dispatch(toggleTrait({ unitId: unit.selectionId, trait: trait.name }));
  };

  const traitControls = (traits: ITrait[]) => {
    return traits.map((trait) => (
      <div key={trait.name} className="is-flex is-align-items-center">
        <div className="is-flex-grow-1 pr-2">
          <RuleList specialRules={[trait]} />
        </div>
        <Checkbox
          checked={!!unit.traits?.find((t) => t === trait.name)}
          onClick={() => toggleUnitTrait(trait)}
          value={trait.name}
          disabled={unit.xp < 5}
        />
      </div>
    ));
  };

  return (
    <>
      <div className="px-4 is-flex is-align-items-center">
        <p className="pt-0" style={{ fontWeight: 600, fontSize: "14px", lineHeight: 1.7 }}>
          Campaign Upgrades
        </p>
      </div>
      <Card elevation={0} square>
        <div className="py-2 px-4">
          <div className="is-flex is-align-items-center">
            <div className="is-flex-grow-1 pr-2">
              Unit XP <span style={{ color: "rgba(0,0,0,0.6)" }}>(25pts per 5XP)</span>
            </div>
            <IconButton
              disabled={unit.xp === 0}
              color={unit.xp > 0 ? "primary" : "default"}
              onClick={() => adjustUnitXp(-1)}
            >
              <DownIcon />
            </IconButton>
            <div style={{ color: "#000000" }}>{unit.xp}</div>
            <IconButton disabled={unit.xp >= 30} color={"primary"} onClick={() => adjustUnitXp(1)}>
              <UpIcon />
            </IconButton>
          </div>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>Skill Sets / Traits</AccordionSummary>
            <AccordionDetails>
              {isHero
                ? (traitDefinitions as ISkillSet[]).map((skillSet) => (
                    <Accordion key={skillSet.name}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        {skillSet.name}
                      </AccordionSummary>
                      <AccordionDetails>{traitControls(skillSet.traits)}</AccordionDetails>
                    </Accordion>
                  ))
                : traitControls(traitDefinitions)}
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>Injuries</AccordionSummary>
            <AccordionDetails>{traitControls(injuryDefinitions)}</AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>Talents</AccordionSummary>
            <AccordionDetails>{traitControls(talentDefinitions)}</AccordionDetails>
          </Accordion>
        </div>
      </Card>
    </>
  );
}

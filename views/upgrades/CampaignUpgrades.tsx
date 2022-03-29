import { Card, Checkbox, Divider } from "@mui/material";
import { IconButton } from "@mui/material";
import DownIcon from "@mui/icons-material/KeyboardArrowDown";
import UpIcon from "@mui/icons-material/KeyboardArrowUp";
import { ISelectedUnit } from "../../data/interfaces";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../data/store";
import {
  adjustXp,
  defaultCampaignUnit,
  getTraitDefinitions,
  ISkillSet,
  ITrait,
  toggleTrait,
} from "../../data/campaignSlice";
import { Fragment } from "react";

interface CampaignUpgradesProps {
  unit: ISelectedUnit;
  gameSystem: string;
}

export default function CampaignUpgrades(props: CampaignUpgradesProps) {
  const dispatch = useDispatch();
  const campaignUnits = useSelector((state: RootState) => state.campaign.units);
  const campaignUnit =
    campaignUnits.find((u) => u.unitId === props.unit.selectionId) ?? defaultCampaignUnit;

  const isHero = props.unit.specialRules.some((r) => r.name === "Hero");
  const traitDefinitions = getTraitDefinitions(props.gameSystem)[isHero ? "heroes" : "units"];

  const adjustUnitXp = (xp: number) => {
    dispatch(adjustXp({ unitId: props.unit.selectionId, xp }));
  };

  const toggleUnitTrait = (trait: ITrait) => {
    dispatch(toggleTrait({ unitId: props.unit.selectionId, trait: trait.name }));
  };

  const traitControls = (traits: ITrait[]) => {
    return traits.map((trait) => (
      <div key={trait.name} className="is-flex is-align-items-center">
        <div className="is-flex-grow-1 pr-2">{trait.name}</div>
        <Checkbox
          checked={!!campaignUnit.traits.find((t) => t === trait.name)}
          onClick={() => toggleUnitTrait(trait)}
          value={trait.name}
          disabled={campaignUnit.xp < 5}
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
            <div className="is-flex-grow-1 pr-2">Unit XP</div>
            <IconButton
              disabled={campaignUnit.xp === 0}
              color={campaignUnit.xp > 0 ? "primary" : "default"}
              onClick={() => adjustUnitXp(-1)}
            >
              <DownIcon />
            </IconButton>
            <div style={{ color: "#000000" }}>{campaignUnit.xp}</div>
            <IconButton color={"primary"} onClick={() => adjustUnitXp(1)}>
              <UpIcon />
            </IconButton>
          </div>

          {isHero
            ? (traitDefinitions as ISkillSet[]).map((skillSet) => (
                <Fragment key={skillSet.name}>
                  <Divider />
                  <p className="mt-2" style={{ fontWeight: 600, fontSize: "14px" }}>{skillSet.name}</p>
                  {traitControls(skillSet.traits)}
                </Fragment>
              ))
            : traitControls(traitDefinitions)}
        </div>
      </Card>
    </>
  );
}

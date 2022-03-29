import { Card, Checkbox } from "@mui/material";
import { IconButton } from "@mui/material";
import DownIcon from "@mui/icons-material/KeyboardArrowDown";
import UpIcon from "@mui/icons-material/KeyboardArrowUp";
import { ISelectedUnit } from "../../data/interfaces";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../data/store";
import { adjustXp, defaultCampaignUnit, getTraitDefinitions } from "../../data/campaignSlice";

interface CampaignUpgradesProps {
  unit: ISelectedUnit;
  gameSystem: string;
}

export default function CampaignUpgrades(props: CampaignUpgradesProps) {
  const dispatch = useDispatch();
  const campaignUnits = useSelector((state: RootState) => state.campaign.units);
  const campaignUnit =
    campaignUnits.find((u) => u.unitId === props.unit.selectionId) ?? defaultCampaignUnit;

  const traitDefinitions = getTraitDefinitions(props.gameSystem);

  const adjustUnitXp = (xp: number) => {
    dispatch(adjustXp({ unitId: props.unit.selectionId, xp }));
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

          {traitDefinitions.map((trait) => (
            <div key={trait.name} className="is-flex is-align-items-center">
              <div className="is-flex-grow-1 pr-2">{trait.name}</div>
              <Checkbox checked={!!campaignUnit.traits.find(t => t === trait.name)} onClick={() => {}} value={trait.name} />
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

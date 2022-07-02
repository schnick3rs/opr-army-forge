import { Paper } from "@mui/material";
import { ISelectedUnit, IUpgrade, IUpgradeGainsWeapon } from "../../data/interfaces";
import EquipmentService from "../../services/EquipmentService";
import UpgradeService from "../../services/UpgradeService";
import { CustomTooltip } from "../components/CustomTooltip";
import UpgradeItem from "./UpgradeItem";
import LinkIcon from "@mui/icons-material/Link";

interface UpgradeGroupProps {
  unit: ISelectedUnit;
  upgrade: IUpgrade;
  previewMode: boolean;
}
export default function UpgradeGroup({ unit, upgrade, previewMode }: UpgradeGroupProps) {
  if (unit.joinToUnit && upgrade.isCommandGroup) return null;

  const controlType = UpgradeService.getControlType(unit, upgrade);

  // TODO: #177
  const getProfile = (target: string) => {
    var e = unit.equipment.find((e) => EquipmentService.compareEquipment(e, target));
    return e ? EquipmentService.formatString(e as IUpgradeGainsWeapon) : "";
  };

  const defaultItemLabel =
    upgrade.type === "replace"
      ? "Default" // - ${upgrade.replaceWhat?.map((what) => getProfile(what) || "...").join(", ")}`
      : "None";
  const defaultItem = controlType === "radio" && (
    <UpgradeItem
      selectedUnit={unit}
      upgrade={upgrade}
      option={null}
      previewMode={previewMode}
      controlType={controlType}
      label={defaultItemLabel}
    />
  );

  let groupTitle = upgrade.label;

  for (let what of upgrade.replaceWhat ?? []) {
    const profile = getProfile(what);
    if (profile) groupTitle = groupTitle.replace(what, profile);
  }

  return (
    <div className={"mt-4"}>
      <div className="px-4 is-flex is-align-items-center">
        {unit.combined && upgrade.affects === "all" && (
          <CustomTooltip
            title="This option will be the same on both combined units."
            arrow
            enterTouchDelay={0}
            leaveTouchDelay={5000}
          >
            <LinkIcon sx={{ fontSize: 22 }} className="mr-2" />
          </CustomTooltip>
        )}
        <p
          className="pt-0"
          style={{
            fontWeight: "600",
            lineHeight: 1.7,
          }}
        >
          {groupTitle}{" "}
          {upgrade.type === "replace" && controlType !== "radio" && (
            <span style={{ color: "rgba(0,0,0,0.6)" }}>
              [{UpgradeService.countAvailable(unit, upgrade)}]
            </span>
          )}
        </p>
      </div>
      <Paper className="px-4 py-2" square elevation={0}>
        {defaultItem}
        {upgrade.options.map((opt, i) => (
          <UpgradeItem
            key={i}
            selectedUnit={unit}
            upgrade={upgrade}
            option={opt}
            controlType={controlType}
            previewMode={previewMode}
          />
        ))}
      </Paper>
    </div>
  );
}

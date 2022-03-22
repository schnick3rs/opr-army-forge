import { Paper } from "@mui/material";
import { ISelectedUnit, IUpgrade } from "../../data/interfaces";
import EquipmentService from "../../services/EquipmentService";
import UpgradeService from "../../services/UpgradeService";
import UpgradeItem from "./UpgradeItem";

export default function UpgradeGroup({
  unit,
  upgrade,
}: {
  unit: ISelectedUnit;
  upgrade: IUpgrade;
}) {
  const controlType = UpgradeService.getControlType(unit, upgrade);

  const getProfile = (target: string) => {
    var e = unit.equipment.find((e) =>
      EquipmentService.compareEquipment(e, target)
    );
    return e.label;
  };

  const firstItem =
    controlType === "radio" ? (
      <UpgradeItem selectedUnit={unit} upgrade={upgrade} option={null} />
    ) : null;
  // (
  //   upgrade.replaceWhat && (
  //     <p className="my-2">
  //       {upgrade.replaceWhat?.map(getProfile).join(", ")}
  //     </p>
  //   )
  // );

  return (
    <Paper className="px-4 py-2" square elevation={0}>
      {
        // "None" / Default option for radio group
        firstItem
      }
      {upgrade.options.map((opt, i) => (
        <UpgradeItem
          key={i}
          selectedUnit={unit}
          upgrade={upgrade}
          option={opt}
        />
      ))}
    </Paper>
  );
}

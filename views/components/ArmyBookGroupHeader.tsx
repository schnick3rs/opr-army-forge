import { IconButton } from "@mui/material";
import { IArmyData } from "../../data/armySlice";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

interface ArmyBookGroupHeaderProps {
  army: IArmyData;
  collapsed: boolean;
  setCollapsed: any;
  points?: number;
}

export default function ArmyBookGroupHeader(props: ArmyBookGroupHeaderProps) {
  return (
    <div className={`px-4 py-2 is-flex is-align-items-center`}>
      <h3 className="is-flex-grow-1" style={{ fontWeight: 600 }}>
        {props.army.name} - {props.army.versionString}
      </h3>
      {props.points && <span>{props.points}pts</span>}
      <IconButton onClick={() => props.setCollapsed((prev: boolean) => !prev)} color="primary">
        {props.collapsed ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
      </IconButton>
    </div>
  );
}

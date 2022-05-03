import { IconButton } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

interface MainListHeaderProps {
  leftText: string;
  rightText?: string;
  collapsed: boolean;
  setCollapsed: any;
}

export default function MainListHeader(props: MainListHeaderProps) {
  return (
    <div className={`px-4 py-2 is-flex is-align-items-center`}>
      <h3 className="is-flex-grow-1" style={{ fontWeight: 600 }}>
        {props.leftText}
      </h3>
      {props.rightText && <span>{props.rightText}</span>}
      <IconButton onClick={() => props.setCollapsed((prev: boolean) => !prev)} color="primary">
        {props.collapsed ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
      </IconButton>
    </div>
  );
}

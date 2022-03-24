import styles from "./UnitSelection.module.css";
import { useSelector } from "react-redux";
import { RootState } from "../data/store";
import { Fragment, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  Divider,
  IconButton,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EquipmentService from "../services/EquipmentService";
import RuleList from "./components/RuleList";
import { IUnit } from "../data/interfaces";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import UnitService from "../services/UnitService";

export function UnitSelection({
  onSelected,
  addUnit = (unit: IUnit, dummy = false) => {},
  mobile = false,
}) {
  const armyData = useSelector((state: RootState) => state.army);

  return (
    <>
      {armyData.loadedArmyBooks.map((book) => (
        <UnitSelectionForArmy
          key={book.uid}
          onSelected={onSelected}
          addUnit={addUnit}
          mobile={mobile}
          army={book}
        />
      ))}
    </>
  );
}

function UnitSelectionForArmy({
  onSelected,
  addUnit = (unit: IUnit, dummy = false) => {},
  mobile = false,
  army,
}) {
  // Access the main army definition state
  const list = useSelector((state: RootState) => state.list);

  const [collapsed, setCollapsed] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  //const [expandAll, setExpandAll] = useState(true);
  const expandAll = true;

  if (!army) return null;

  // Group army units by category
  const isTough = (u: IUnit, threshold) =>
    u.specialRules.some((r) => {
      if (r.name !== "Tough") return false;
      const toughness = parseInt(r.rating);
      return toughness >= threshold;
    });
  const hasRule = (u: IUnit, rule: string) =>
    u.specialRules.some((r) => r.name === rule);

  const unitGroups = {
    Heroes: [],
    "Core Units": [],
    "Vehicles / Monsters": [],
    Artillery: [],
    Titans: [],
    Aircraft: [],
  };

  for (let unit of army.units) {
    if (hasRule(unit, "Hero")) unitGroups["Heroes"].push(unit);
    else if (hasRule(unit, "Aircraft")) unitGroups["Aircraft"].push(unit);
    else if (hasRule(unit, "Artillery")) unitGroups["Artillery"].push(unit);
    else if (
      isTough(unit, 18) &&
      unit.defense == "2" &&
      unit.size === 1 &&
      hasRule(unit, "Fear")
    )
      unitGroups["Titans"].push(unit);
    else if (isTough(unit, 6) && unit.defense == "2" && unit.size === 1)
      unitGroups["Vehicles / Monsters"].push(unit);
    else unitGroups["Core Units"].push(unit);
  }

  const handleAddClick = (unit: IUnit) => {
    addUnit({ ...unit, armyId: army.uid });
  };
  const handleSelectClick = (unit: IUnit) => {
    if (expandAll && !mobile) {
      //onSelected({...UnitService.getRealUnit(unit), selectionId: null});
      addUnit({ ...unit, armyId: army.uid }, true);
      onSelected({ selectionId: "dummy" });
    } else {
      setExpandedId(expandedId === unit.name ? null : unit.name);
    }
  };

  const selected =
    list.selectedUnitId === "dummy" && UnitService.getSelected(list).name;

  return (
    <Card
      elevation={2}
      sx={{ backgroundColor: "#FAFAFA", marginBottom: "1rem" }}
      square
    >
      <div
        className={`${styles["army-book-section-header"]} px-4 py-2 is-flex is-align-items-center`}
      >
        <h3 className="is-flex-grow-1">
          {army.name} - {army.versionString}
        </h3>
        <IconButton
          size="small"
          onClick={() => setCollapsed((prev) => !prev)}
          color="primary"
        >
          {collapsed ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
        </IconButton>
      </div>
      {/* <FullCompactToggle
        expanded={expandAll}
        onToggle={() => setExpandAll(!expandAll)}
      /> */}

      {!collapsed &&
        Object.keys(unitGroups).map((key, i) => (
          <Fragment key={key}>
            {key !== "undefined" && unitGroups[key].length > 0 && (
              <p className={"menu-label my-2 px-4 " + (i > 0 ? "pt-3" : "")}>
                {key}
              </p>
            )}
            <Divider />
            {
              // For each unit in category
              unitGroups[key].map((u, index) => {
                const countInList = list?.units.filter(
                  (listUnit) =>
                    listUnit.selectionId !== "dummy" &&
                    listUnit.name === u.name &&
                    listUnit.armyId === army.uid
                ).length;

                return (
                  <>
                    <Paper
                      key={u.name}
                      className="p-4"
                      elevation={0}
                      style={{
                        backgroundColor:
                          countInList > 0 || selected === u.name
                            ? "#F9FDFF"
                            : null,
                        borderLeft:
                          countInList > 0 ? "2px solid #0F71B4" : null,
                        cursor: "pointer",
                      }}
                      square
                      onClick={() => {
                        handleSelectClick(u);
                      }}
                    >
                      <div className="is-flex is-flex-grow-1 is-align-items-center mb-2">
                        <div className="is-flex-grow-1">
                          <p className="mb-1">
                            {countInList > 0 && (
                              <span style={{ color: "#0F71B4" }}>
                                {countInList}x{" "}
                              </span>
                            )}
                            <span>{u.name} </span>
                            <span style={{ color: "#656565" }}>[{u.size}]</span>
                          </p>
                          <div
                            className="is-flex"
                            style={{
                              fontSize: "12px",
                              color: "rgba(0,0,0,0.8)",
                            }}
                          >
                            <p>Qua {u.quality}+</p>
                            <p className="ml-2">Def {u.defense}+</p>
                          </div>
                        </div>
                        <p>{u.cost}pts</p>
                        <IconButton
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddClick(u);
                          }}
                        >
                          <AddIcon />
                        </IconButton>
                      </div>
                      <div
                        style={{ fontSize: "12px", color: "rgba(0,0,0,0.8)" }}
                      >
                        {u.equipment.map((eqp, i) => (
                          <p key={i}>
                            {(eqp.count && eqp.count !== 1
                              ? `${eqp.count}x `
                              : "") + EquipmentService.formatString(eqp)}{" "}
                          </p>
                        ))}
                        <RuleList specialRules={u.specialRules} />
                      </div>
                    </Paper>
                    <Divider />
                  </>
                );
              })
            }
          </Fragment>
        ))}
    </Card>
  );
}

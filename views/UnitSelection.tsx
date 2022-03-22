import styles from "../styles/Home.module.css";
import { useSelector } from "react-redux";
import { RootState } from "../data/store";
import { Fragment, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EquipmentService from "../services/EquipmentService";
import RuleList from "./components/RuleList";
import { IUnit } from "../data/interfaces";

import { useMediaQuery } from "react-responsive";
import FullCompactToggle from "./components/FullCompactToggle";
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

  const [expandedId, setExpandedId] = useState(null);
  const [expandAll, setExpandAll] = useState(true);

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
  const isBigScreen = useMediaQuery({ query: "(min-width: 1024px)" });

  return (
    <aside className={styles.menu + " menu"} style={{ minHeight: "100%" }}>
      {/* <div className={isBigScreen ? "sticky" : ""}> */}
      <div>
        {isBigScreen && (
          <div className="is-flex is-align-items-center">
            <h3 className="is-size-4 px-4 pt-4 is-flex-grow-1">
              {army.name} - {army.versionString}
            </h3>
          </div>
        )}
      </div>
      <FullCompactToggle
        expanded={expandAll}
        onToggle={() => setExpandAll(!expandAll)}
      />

      {
        // For each category
        Object.keys(unitGroups).map((key, i) => (
          <Fragment key={key}>
            {key !== "undefined" && unitGroups[key].length > 0 && (
              <p className={"menu-label my-2 px-4 " + (i > 0 ? "pt-3" : "")}>
                {key}
              </p>
            )}
            <ul className="menu-list">
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
                    <Accordion
                      key={u.name}
                      style={{
                        backgroundColor:
                          countInList > 0 || selected === u.name
                            ? "#F9FDFF"
                            : null,
                        borderLeft:
                          countInList > 0 ? "2px solid #0F71B4" : null,
                        cursor: "pointer",
                      }}
                      disableGutters
                      square
                      elevation={1}
                      expanded={expandedId === u.name || expandAll}
                      onChange={() =>
                        setExpandedId(expandedId === u.name ? null : u.name)
                      }
                      onClick={() => {
                        handleSelectClick(u);
                      }}
                    >
                      <AccordionSummary>
                        <div className="is-flex is-flex-grow-1 is-align-items-center">
                          <div className="is-flex-grow-1">
                            <p className="mb-1" style={{ fontWeight: 600 }}>
                              {countInList > 0 && (
                                <span style={{ color: "#0F71B4" }}>
                                  {countInList}x{" "}
                                </span>
                              )}
                              <span>{u.name} </span>
                              <span style={{ color: "#656565" }}>
                                [{u.size}]
                              </span>
                            </p>
                            <div
                              className="is-flex"
                              style={{ fontSize: "14px", color: "#666" }}
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
                      </AccordionSummary>
                      <AccordionDetails
                        className="pt-0"
                        style={{
                          flexDirection: "column",
                          fontSize: "14px",
                          color: "#666",
                          lineHeight: 1.4,
                        }}
                      >
                        <div>
                          {u.equipment.map((eqp, i) => (
                            <p key={i}>
                              {(eqp.count && eqp.count !== 1
                                ? `${eqp.count}x `
                                : "") + EquipmentService.formatString(eqp)}{" "}
                            </p>
                          ))}
                        </div>
                        <div>
                          <RuleList specialRules={u.specialRules} />
                        </div>
                      </AccordionDetails>
                    </Accordion>
                  );
                })
              }
            </ul>
          </Fragment>
        ))
      }
    </aside>
  );
}

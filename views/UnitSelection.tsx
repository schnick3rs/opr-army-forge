import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../data/store";
import { Fragment, useState } from "react";
import { Card, Divider, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { IUnit } from "../data/interfaces";

import UnitService from "../services/UnitService";
import ArmyBookGroupHeader from "./components/ArmyBookGroupHeader";
import UnitListItem from "./components/UnitListItem";
import { addUnit, removeUnit, selectUnit } from "../data/listSlice";
import { useRouter } from "next/router";

export function UnitSelection() {
  const loadedArmyBooks = useSelector(
    (state: RootState) => state.army.loadedArmyBooks
  );

  return (
    <>
      {loadedArmyBooks.map((book) => (
        <UnitSelectionForArmy
          key={book.uid}
          army={book}
          showTitle={loadedArmyBooks.length > 1}
        />
      ))}
    </>
  );
}

function UnitSelectionForArmy({ army, showTitle }) {
  const dispatch = useDispatch();
  const router = useRouter();

  const list = useSelector((state: RootState) => state.list);
  const [collapsed, setCollapsed] = useState(false);

  function onAddUnit(unit: IUnit, dummy = false) {
    if (dummy) {
      if (list.units.some((u) => u.selectionId === "dummy")) {
        dispatch(removeUnit("dummy"));
      }
    }
    dispatch(addUnit(UnitService.getRealUnit(unit, dummy)));
  }

  function onSelected(unit: { selectionId: string }) {
    if (list.selectedUnitId !== unit.selectionId) {
      if (list.selectedUnitId === "dummy") {
        dispatch(removeUnit("dummy"));
      }
      dispatch(selectUnit(unit.selectionId));
    }
  }

  const handleAddClick = (unit: IUnit) => {
    onAddUnit({ ...unit, armyId: army.uid });
  };
  const handleSelectClick = (unit: IUnit) => {
    onAddUnit({ ...unit, armyId: army.uid }, true);
    onSelected({ selectionId: "dummy" });
    router.push({ query: { ...router.query, upgradesOpen: true } });
  };

  const unitGroups = getUnitCategories(army.units);
  const selectedUnitName =
    list.selectedUnitId === "dummy" && UnitService.getSelected(list).name;

  return (
    <Card
      elevation={2}
      sx={{ backgroundColor: "#FAFAFA", marginBottom: "1rem" }}
      square
    >
      {showTitle && (
        <ArmyBookGroupHeader
          army={army}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      )}

      {!collapsed &&
        Object.keys(unitGroups).map((key, i) => (
          <Fragment key={key}>
            {key !== "undefined" && unitGroups[key].length > 0 && (
              <p className={"menu-label my-2 px-4 " + (i > 0 ? "pt-3" : "")}>
                {key}
              </p>
            )}
            <Divider />
            {unitGroups[key].map((u, index) => {
              const countInList = list?.units.filter(
                (listUnit) =>
                  listUnit.selectionId !== "dummy" &&
                  listUnit.name === u.name &&
                  listUnit.armyId === army.uid
              ).length;

              return (
                <UnitListItem
                  key={u.id}
                  unit={u}
                  countInList={countInList}
                  selected={countInList > 0 || selectedUnitName === u.name}
                  onClick={() => {
                    handleSelectClick(u);
                  }}
                  rightControl={
                    <IconButton
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddClick(u);
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  }
                />
              );
            })}
          </Fragment>
        ))}
    </Card>
  );
}

function getUnitCategories(units: IUnit[]) {
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

  for (let unit of units) {
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

  return unitGroups;
}

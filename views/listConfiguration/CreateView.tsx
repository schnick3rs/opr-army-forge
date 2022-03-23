import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  List,
  ListItem,
  ListItemText,
  Radio,
} from "@mui/material";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getArmyBookData } from "../../data/armySlice";
import { createList } from "../../data/listSlice";
import { RootState } from "../../data/store";
import PersistenceService from "../../services/PersistenceService";
import MultipleArmySelections from "./MultipleArmySelections";

interface CreateViewProps {
  armyName: string;
  pointsLimit: number;
}

export function CreateView(props: CreateViewProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const armyState = useSelector((state: RootState) => state.army);

  const [autoSave, setAutoSave] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);

  const factionName = router.query["faction"] as string;
  const armyId = router.query["armyId"] as string;

  const factionData = armyState.armyBooks?.filter(
    (a) => a.factionName === factionName && a.official === true
  );
  const factionRelation =
    factionData?.length > 0 ? factionData[0].factionRelation : null;
  const factionRoot =
    factionData?.find((x) => !x.factionRelation) ?? factionData?.[0];

  const armyData = armyState.loadedArmyBooks?.[0];

  useEffect(() => {
    if (armyState.armyBooks?.length < 1) return;

    // if (factionName) {
    //   const rootArmy =
    //     factionData.find((x) => x.factionRelation === null) ?? factionData[0];

    //   setSelectedChild(rootArmy.name);
    //   dispatch(
    //     getArmyBookData({
    //       armyUid: rootArmy.uid,
    //       gameSystem: armyState.gameSystem,
    //       reset: false
    //     })
    //   );
    // } else
    
    if (
      armyId &&
      !armyState.loadedArmyBooks.some((book) => book.uid === armyId)
    ) {
      dispatch(
        getArmyBookData({
          armyUid: armyId,
          gameSystem: armyState.gameSystem,
          reset: false,
        })
      );
    }
  }, [armyState.armyBooks, armyState.loadedArmyBooks]);

  const childItem = (child) => (
    <ListItem
      divider
      className="px-0"
      style={{ cursor: child.isLive ? "pointer" : "" }}
      onClick={() => (child.isLive ? selectChild(child) : null)}
    >
      <ListItemText
        style={{ color: !child.isLive ? "#999" : "" }}
        primary={
          child.name === factionRoot.name && !factionRoot.factionRelation
            ? "None"
            : child.name
        }
      />
      <Radio
        disabled={!child.isLive}
        value={child}
        checked={selectedChild === child.name}
      />
    </ListItem>
  );

  const selectChild = (child) => {
    console.log("Selecting child", child);
    router.replace({ query: { ...router.query, armyId: child.uid } }, null, {
      shallow: true,
    });
    dispatch(
      getArmyBookData({
        armyUid: child.uid,
        gameSystem: armyState.gameSystem,
        reset: true,
      })
    );
    setSelectedChild(child.name);
  };

  const create = async () => {
    if (factionData?.length > 0 && !selectedChild)
      return alert("Must select a " + factionRelation);

    const name = props.armyName || "My List";

    const creationTime = autoSave
      ? PersistenceService.createSave(armyState, name)
      : null;

    dispatch(
      createList({
        name,
        pointsLimit: props.pointsLimit || 0,
        creationTime: creationTime,
      })
    );

    router.push({ pathname: "/list", query: { listId: creationTime } });
  };

  return (
    <>
      {armyData && factionData?.length > 0 && (
        <>
          <h3 className="mt-4 mb-0" style={{ fontWeight: 600 }}>
            {factionRelation}
          </h3>
          <List className="pt-0">
            {childItem(factionRoot)}
            {factionData
              .filter((c) => c.name !== factionRoot.name)
              .map((child, index) => (
                <Fragment key={index}>{childItem(child)}</Fragment>
              ))}
          </List>
        </>
      )}
      <MultipleArmySelections />
      <FormGroup className="mt-4 mb-2 is-flex-direction-row is-align-items-center">
        <FormControlLabel
          control={
            <Checkbox
              checked={autoSave}
              onClick={() => setAutoSave(!autoSave)}
            />
          }
          label="Auto Save List"
        />
      </FormGroup>
      <Button
        className="mx-auto px-6"
        variant="contained"
        onClick={() => create()}
        disabled={armyState.loadingArmyData}
      >
        Create List
      </Button>
    </>
  );
}

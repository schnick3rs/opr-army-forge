import { useState, useEffect, Fragment } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../data/store";
import { useRouter } from "next/router";
import {
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  TextField,
} from "@mui/material";
import {
  AppBar,
  IconButton,
  Toolbar,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Radio,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { createList, updateListSettings } from "../data/listSlice";
import {
  getArmyBookData,
  getArmyBooks,
  loadArmyData,
  setGameSystem,
} from "../data/armySlice";
import ArmyImage from "../views/components/ArmyImage";
import PersistenceService from "../services/PersistenceService";

export default function ListConfiguration() {
  const dispatch = useDispatch();
  const router = useRouter();

  const isEdit = !!router.query["edit"];

  const armyState = useSelector((state: RootState) => state.army);
  const listState = useSelector((state: RootState) => state.list);

  const [armyName, setArmyName] = useState(isEdit ? listState.name : "");
  const [pointsLimit, setPointsLimit] = useState(
    isEdit ? listState.pointsLimit : null
  );
  const [autoSave, setAutoSave] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);

  const factionName = router.query["faction"] as string;
  const armyId = router.query["armyId"] as string;

  const factionData = armyState.armyBooks?.filter(
    (a) => a.factionName === factionName && a.official === true
  );
  const factionRelation =
    factionData?.length > 0 ? factionData[0].factionRelation : null;
  const factionRoot = factionData?.find((x) => !x.factionRelation);

  useEffect(() => {
    // Ensure gameSystem is set
    if (!armyState.gameSystem) {
      dispatch(setGameSystem(router.query["gameSystem"] as string));
      return;
    }
    // Load books if not loaded
    if (armyState.armyBooks?.length <= 0) {
      dispatch(getArmyBooks(armyState.gameSystem));
      return;
    }

    // Ensure army data is loaded
    if (!armyState.data) {
      console.log("No army data");
      if (armyId) {
        dispatch(
          getArmyBookData({
            armyUid: armyId,
            gameSystem: armyState.gameSystem,
          })
        );
      }
      if (factionName) {
        const rootArmy = factionData.find((x) => x.factionRelation === null);
        setSelectedChild(rootArmy.name);
        if (!armyId) {
          dispatch(
            getArmyBookData({
              armyUid: rootArmy.uid,
              gameSystem: armyState.gameSystem,
            })
          );
        }
      }
      return;
    }

    setArmyName(armyState.data.name);
  }, [armyState.gameSystem, armyState.armyBooks, armyState.data]);

  const create = async () => {
    if (factionData?.length > 0 && !selectedChild)
      return alert("Must select a " + factionRelation);

    const name = armyName || "My List";

    const creationTime = autoSave
      ? PersistenceService.createSave(armyState, name)
      : null;

    dispatch(
      createList({
        name,
        pointsLimit: pointsLimit || 0,
        creationTime: creationTime,
      })
    );

    router.push("/list");
  };

  const update = () => {
    dispatch(
      updateListSettings({ name: armyName, pointsLimit: pointsLimit || 0 })
    );

    router.back();
  };

  const selectChild = (child) => {
    console.log("Selecting child", child);
    router.replace({ query: { ...router.query, armyId: child.uid } }, null, {
      shallow: true,
    });
    dispatch(
      getArmyBookData({ armyUid: child.uid, gameSystem: armyState.gameSystem })
    );
    setSelectedChild(child.name);
  };

  const childItem = (child) => (
    <ListItem
      divider
      className="px-0"
      style={{ cursor: child.isLive ? "pointer" : "" }}
      onClick={() => (child.isLive ? selectChild(child) : null)}
    >
      <ListItemText
        style={{ color: !child.isLive ? "#999" : "" }}
        primary={child.name === factionRoot.name ? "None" : child.name}
      />
      <Radio
        disabled={!child.isLive}
        value={child}
        checked={selectedChild === child.name}
        onChange={() => (child.isLive ? selectChild(child) : null)}
      />
    </ListItem>
  );

  const close = () => {
    router.back();
  };

  const editView = (
    <Button className="mt-4" variant="contained" onClick={() => update()}>
      Save Changes
    </Button>
  );

  const createView = (
    <>
      <FormGroup className="mb-0 is-flex-direction-row is-align-items-center">
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
      {armyState.data && factionData?.length > 0 && (
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
      <Button
        className="mt-4"
        variant="contained"
        onClick={() => create()}
        disabled={armyState.loadingArmyData}
      >
        Create List
      </Button>
    </>
  );

  return (
    <>
      <AppBar position="static" elevation={0} color="transparent">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={close}
          >
            <ClearIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {armyState.data?.name || "New Army"}
          </Typography>
        </Toolbar>
      </AppBar>
      {armyState.data && (
        <div className="mx-auto" style={{ maxWidth: "480px" }}>
          <div className="is-flex is-flex-direction-column p-4 mx-auto">
            <div className="mb-6">
              <ArmyImage
                name={factionRoot?.name ?? armyState.data?.name}
                armyData={armyState}
              />
            </div>
            <TextField
              variant="filled"
              label="List Name"
              className="mb-4"
              value={armyName}
              onChange={(e) => setArmyName(e.target.value)}
            />
            <TextField
              variant="filled"
              label="Points Limit"
              type="number"
              className="mb-4"
              value={pointsLimit ?? ""}
              onChange={(e) =>
                setPointsLimit(e.target.value ? parseInt(e.target.value) : null)
              }
            />
            {isEdit ? editView : createView}
          </div>
        </div>
      )}
    </>
  );
}

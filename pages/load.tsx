import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Paper,
  Checkbox,
  Toolbar,
  AppBar,
  Typography,
} from "@mui/material";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import _ from "lodash";
import { Delete } from "@mui/icons-material";
import PersistenceService from "../services/PersistenceService";
import { ISaveData } from "../data/interfaces";
import ArmyImage from "../views/components/ArmyImage";
import { store } from "../data/store";
import { MenuBar } from "../views/components/MenuBar";
import { tryBack } from "../services/Helpers";
import StarIcon from "@mui/icons-material/Star";
import BackIcon from "@mui/icons-material/ArrowBackIosNew";
import { useLongPress } from "use-long-press";
import UAParser from "ua-parser-js";

export default function Load() {
  const dispatch = useDispatch<typeof store.dispatch>();
  const router = useRouter();
  const [localSaves, setLocalSaves] = useState([]);
  const [forceLoad, setForceLoad] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selections, setSelections] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const uaResult = new UAParser(ua);
    const device = uaResult.getDevice();
    setIsMobile(device.type === "mobile");
  }, []);

  useEffect(() => {
    const getSaves = () => Object.keys(localStorage).filter((k) => k.startsWith("AF_Save"));
    for (let save of getSaves()) {
      if (localStorage.getItem(save).indexOf('"listPoints":0') >= 0) delete localStorage[save];
    }

    setLocalSaves(getSaves());
  }, [forceLoad]);

  const importFile = () => {
    var fileInput = document.getElementById("file-input");
    fileInput.dispatchEvent(new MouseEvent("click"));
    //const fileSystemHandles = window.showOpenFilePicker();
    //console.log(fileSystemHandles);
  };

  const onItemClick = (save: ISaveData) => {
    console.log("Item clicked");
    if (selections.length === 0) {
      loadSave(save);
    } else {
      selectSave(save);
    }
  };

  const loadSave = (save: ISaveData) => {
    setLoading(true);
    PersistenceService.load(dispatch, save, (armyData) => {
      router.push({
        pathname: "/list",
        query: { listId: save.list.creationTime },
      });
      setLoading(false);
    });
  };

  const forEachSelection = (callback) => {
    for (var key of selections) {
      const actualKey = Object.keys(localStorage).find((x) => x.endsWith(key));
      callback(JSON.parse(localStorage.getItem(actualKey)));
    }
    setForceLoad(forceLoad + 1);
    setLocalSaves([]);
  };

  const selectSave = (save) => {
    const selected = selections.some((x) => x === save.list.creationTime);
    setSelections((prev) =>
      selected
        ? prev.filter((x) => x !== save.list.creationTime)
        : prev.concat(save.list.creationTime)
    );
  };

  const deleteSave = (save) => {
    PersistenceService.delete(save.list);
  };

  const toggleFavourite = (save) => {
    PersistenceService.toggleFavourite(save);
  };

  const readSingleFile = (e) => {
    var file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    const reader = new FileReader();

    reader.onload = function (event) {
      try {
        const json: string = event.target.result as string;
        const saveData: ISaveData = JSON.parse(json);

        PersistenceService.load(dispatch, saveData, (_) => {
          router.push("/list");
          // Save to local
          const saveName = file.name.replace(".json", "");
          // if it doesn't exist, or user confirms they are happy to overwrite
          if (
            !PersistenceService.checkExists(saveData.list) ||
            confirm(
              "It looks like this list already exists. Are you sure you'd like to overwrite it?"
            )
          ) {
            PersistenceService.saveImport(saveName, json);
          }

          setLoading(false);
        });
      } catch (e) {
        setLoading(false);
      }
    };

    reader.readAsText(file);
  };

  const parsedSaves = localSaves.map((key) => JSON.parse(localStorage[key]));

  const SaveList = ({ saves }) => {
    return (
      <Paper square elevation={0}>
        <List>
          {_.sortBy(saves, (save) => save.modified)
            .reverse()
            .map((save) => {
              try {
                const selected = selections.some((x) => x === save.list.creationTime);
                const modified = new Date(save.modified);
                const time = modified.getHours() + ":" + modified.getMinutes();
                const points = save.listPoints;
                const title = (
                  <>
                    <span style={{ fontWeight: 600 }}>
                      {save.gameSystem?.toUpperCase()} - {save.list.name}
                    </span>
                    <span style={{ color: "#656565" }}> • {points}pts</span>
                  </>
                );

                const bindLongPress = useLongPress(
                  (_) => {
                    selectSave(save);
                  },
                  {
                    onCancel: (_) => onItemClick(save),
                  }
                );

                return (
                  <ListItem
                    key={save.list.creationTime}
                    disablePadding
                    secondaryAction={
                      (selections?.length > 0 || !isMobile) && (
                        <Checkbox checked={selected} onClick={() => selectSave(save)} />
                      )
                    }
                    style={{ backgroundColor: selected ? "#F9FDFF" : null }}
                  >
                    <ListItemButton {...bindLongPress()}>
                      <ListItemAvatar>
                        <ArmyImage
                          image={save.coverImagePath}
                          name={save.armyFaction || save.armyName}
                          armyData={{ gameSystem: save.gameSystem }}
                          size={"32px"}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        className={"ml-2" + (save.saveVersion >= 2 ? "" : " has-text-danger")}
                        primary={title}
                        secondary={
                          save.saveVersion >= 2
                            ? "Modified " + modified.toLocaleDateString() + " " + time
                            : "Outdated save format!"
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                );
              } catch (e) {
                console.error(e);
              }
            })}
        </List>
      </Paper>
    );
  };

  const favourites = parsedSaves.filter((s) => s.favourite);

  return (
    <>
      {selections.length === 0 ? (
        <MenuBar title="Open a List" onBackClick={() => tryBack(() => router.replace("/"))} />
      ) : (
        <Paper elevation={2} square>
          <AppBar color="transparent" position="static">
            <Toolbar>
              <IconButton
                size="large"
                edge="start"
                color="primary"
                aria-label="menu"
                sx={{ mr: 2 }}
                onClick={() => setSelections([])}
              >
                <BackIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                {selections.length} selected lists
              </Typography>
              <IconButton color="primary" onClick={() => forEachSelection(toggleFavourite)}>
                <StarIcon />
              </IconButton>
              <IconButton
                color="primary"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${selections.length} list(s)?`)) {
                    forEachSelection(deleteSave);
                    setSelections([]);
                  }
                }}
              >
                <Delete />
              </IconButton>
            </Toolbar>
          </AppBar>
        </Paper>
      )}
      <div className="container">
        <input type="file" id="file-input" style={{ display: "none" }} onChange={readSingleFile} />
        <div className="mx-auto" style={{ maxWidth: "480px" }}>
          <div className="is-flex is-justify-content-center p-4 my-4">
            <Button variant="contained" color="primary" onClick={() => importFile()}>
              <FileUploadOutlinedIcon /> <span className="ml-2">Upload Army Forge File</span>
            </Button>
          </div>
          {loading && (
            <div className="is-flex is-flex-direction-column is-align-items-center">
              <CircularProgress />
              <p>Loading army data...</p>
            </div>
          )}
          {favourites.length > 0 && (
            <>
              <p className="px-4 mb-2" style={{ fontWeight: 600 }}>
                Favourite Lists
              </p>
              <SaveList saves={favourites} />
            </>
          )}
          <p className="px-4 my-2" style={{ fontWeight: 600 }}>
            Saved Lists
          </p>
          <SaveList saves={parsedSaves.filter((s) => !s.favourite)} />
        </div>
      </div>
    </>
  );
}

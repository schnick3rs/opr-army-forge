import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../data/store";
import { useRouter } from "next/router";
import ViewCards from "../views/ViewCards";
import ViewList from "../views/ViewList";
import {
  AppBar,
  Button,
  IconButton,
  Paper,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Switch,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SettingsIcon from "@mui/icons-material/Settings";
import ViewAgendaIcon from "@mui/icons-material/ViewAgenda";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ClearIcon from "@mui/icons-material/Clear";
import { PreviewRounded } from "@mui/icons-material";
import PersistenceService from "../services/PersistenceService";

export interface IViewPreferences {
  showFullRules: boolean;
  showPointCosts: boolean;
  combineSameUnits: boolean;
}

export default function View() {
  const list = useSelector((state: RootState) => state.list);
  const router = useRouter();

  const defaultPrefs = {
    showFullRules: false,
    showPointCosts: true,
    combineSameUnits: true,
  } as IViewPreferences;

  const [preferences, setPreferenceState] = useState({
    ...defaultPrefs,
    ...PersistenceService.getViewPreferences(),
  });
  const [isCardView, setCardView] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  function setPreferences(setFunc) {
    const newPrefs = setFunc(preferences);
    setPreferenceState(setFunc);
    PersistenceService.saveViewPreferences(newPrefs);
  }

  const showPsychic = listContainsPyschic(list);

  return (
    <>
      <Paper elevation={2} color="primary" square>
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={() => router.back()}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {list.name} • {list.points}pts
            </Typography>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setSettingsOpen(true)}
            >
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </Paper>
      <Drawer anchor="right" open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <div className="is-flex p-4">
          <h3 className="is-size-4" style={{ flex: 1 }}>
            Display Settings
          </h3>
          <IconButton onClick={() => setSettingsOpen(false)}>
            <ClearIcon />
          </IconButton>
        </div>
        <List>
          <ListItem>
            <ListItemText>Show full special rules text</ListItemText>
            <Switch
              edge="end"
              checked={preferences.showFullRules}
              onChange={() =>
                setPreferences((prefs) => ({ ...prefs, showFullRules: !prefs.showFullRules }))
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText>Show point costs</ListItemText>
            <Switch
              edge="end"
              checked={preferences.showPointCosts}
              onChange={() =>
                setPreferences((prefs) => ({ ...prefs, showPointCosts: !prefs.showPointCosts }))
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText>Combine Similar Units</ListItemText>
            <Switch
              edge="end"
              checked={preferences.combineSameUnits}
              onChange={() =>
                setPreferences((prefs) => ({ ...prefs, combineSameUnits: !prefs.combineSameUnits }))
              }
            />
          </ListItem>
        </List>
      </Drawer>
      <div className="is-flex px-4 py-2 no-print" style={{ alignItems: "center" }}>
        <div className="is-flex-grow-1"></div>
        <Button onClick={() => setCardView(!isCardView)}>
          {isCardView ? <DashboardIcon /> : <ViewAgendaIcon />}
          <span className="pl-1 full-compact-text">{isCardView ? "cards" : "list"}</span>
        </Button>
      </div>
      <div className="px-4">
        {isCardView ? (
          <ViewCards
            showPsychic={showPsychic}
            showFullRules={preferences.showFullRules}
            showPointCosts={preferences.showPointCosts}
            combineSameUnits={preferences.combineSameUnits}
          />
        ) : (
          <ViewList
            showPsychic={showPsychic}
            showFullRules={preferences.showFullRules}
            showPointCosts={preferences.showPointCosts}
          />
        )}
      </div>
    </>
  );
}

// TODO: extract these as global helper functions
function listContainsPyschic(list) {
  // TODO: get the special rule def from a well known location
  return listContainsSpecialRule(list, { key: "psychic", name: "Psychic", rating: "1" });
}

function listContainsSpecialRule(list, specialRule) {
  return list.units.some(({ specialRules }) =>
    Boolean(specialRules.find(({ name }) => name === specialRule.name))
  );
}

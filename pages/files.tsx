import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../data/store";
import {
  getArmyBookData,
  getArmyBooks,
  IArmyData,
  loadArmyData,
} from "../data/armySlice";
import { useRouter } from "next/router";
import {
  Card,
  AppBar,
  IconButton,
  Paper,
  Toolbar,
  Typography,
  CircularProgress,
  Snackbar,
  InputAdornment,
  Input,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import BackIcon from "@mui/icons-material/ArrowBackIosNew";
import RightIcon from "@mui/icons-material/KeyboardArrowRight";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { resetList } from "../data/listSlice";
import ArmyImage from "../views/components/ArmyImage";
import _ from "lodash";
import WebappApiService from "../services/WebappApiService";

export default function Files() {
  const armyState = useSelector((state: RootState) => state.army);
  const dispatch = useDispatch();
  const router = useRouter();

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [searchText, setSearchText] = useState("");

  const search = (armies) =>
    armies?.filter((a) => {
      return (
        a.name.toLowerCase().includes(searchText.toLowerCase()) ||
        a.username?.toLowerCase().includes(searchText.toLowerCase())
      );
    });

  const gameSystem = armyState.gameSystem;
  const allArmyBooks = armyState.armyBooks ?? [];
  const armyBooks = search(allArmyBooks);
  const isLive =
    typeof window !== "undefined"
      ? window.location.host === "opr-army-forge.vercel.app" ||
        window.location.host === "army-forge.onepagerules.com"
      : true;

  async function loadApiArmyBooks() {
    // Redirect to game selection screen if no army selected
    if (!armyState.gameSystem) {
      router.push({ pathname: "gameSystem/", query: router.query }, null, {
        shallow: true,
      });
      return;
    }

    // Clear any existing units?
    dispatch(resetList());

    dispatch(getArmyBooks(armyState.gameSystem));
  }

  useEffect(() => {
    loadApiArmyBooks();
  }, [armyState.gameSystem]);

  // TODO: Might not need this...
  useEffect(() => {
    if (allArmyBooks && router.query) {
      let armyId = router.query.armyId as string;
      let army = allArmyBooks.find((t: IArmyData) => t.uid == armyId);
      if (army) {
        chooseArmy(army);
      }
    }
  }, [allArmyBooks]);

  const officialFactions = _.groupBy(
    armyBooks?.filter((ca) => ca.official && ca.factionName) ?? [],
    (a) => a.factionName
  );

  const officialArmies = armyBooks
    ?.filter((ca) => ca.official && !ca.factionName)
    .concat(
      Object.keys(officialFactions).map((key) => ({
        name: key,
        factionName: key,
        factionRelation: officialFactions[key][0].factionRelation,
        official: true,
        // Live if any are live
        isLive: officialFactions[key].reduce(
          (live, next) => live || next.isLive,
          false
        ),
      }))
    );

  const officialActiveArmies = officialArmies?.filter((ca) => ca.isLive);
  const officialInactiveArmies = officialArmies?.filter((ca) => !ca.isLive);

  const customArmies = armyBooks?.filter((a) => a.official === false);

  const chooseArmy = async (army) => {
    const uid = army.uid;
    const navigateToConfig = () => {
      router.push({
        pathname: "/listConfiguration",
        query: { ...router.query, armyId: uid, faction: army.factionName },
      });
    };

    dispatch(loadArmyData(null));
    navigateToConfig();
  };

  const section = (armies, enabled) =>
    armies.map((army, index) => (
      <Tile
        key={index}
        army={army}
        enabled={enabled}
        onSelect={(army) => chooseArmy(army)}
      />
    ));

  const SearchBox = (
    <Input
      className="mt-1"
      sx={{
        flexBasis: "5em",
        flexGrow: 0.25,
        alignSelf: "center",
        color: "white",
        textAlign: "right",
      }}
      id="searchfield"
      size="small"
      margin="none"
      autoComplete="off"
      disableUnderline
      onChange={(e) => {
        setSearchText(e.target.value);
      }}
      value={searchText}
      inputProps={{ style: { textAlign: "right" } }}
      endAdornment={
        <InputAdornment position="end" sx={{ width: "2rem", color: "white" }}>
          {searchText ? (
            <IconButton
              size="small"
              onClick={() => {
                setSearchText(
                  ((
                    document.getElementById("searchfield") as HTMLInputElement
                  ).value = "")
                );
              }}
            >
              <ClearIcon sx={{ color: "white" }} />
            </IconButton>
          ) : (
            <SearchIcon
              onClick={() => {
                document.getElementById("searchfield").focus();
              }}
            />
          )}
        </InputAdornment>
      }
    />
  );

  const activeArmies = isLive
    ? officialActiveArmies
    : officialActiveArmies.concat(officialInactiveArmies);

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
              onClick={() => router.push("/gameSystem")}
            >
              <BackIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Create new list
            </Typography>
            {SearchBox}
          </Toolbar>
        </AppBar>
      </Paper>
      <div className="container">
        <div className="mx-auto p-4">
          <div className="mb-4 has-text-centered is-clearfix">
            <h3 className="is-size-4 pt-4">Choose your army</h3>
          </div>
          {!(armyBooks?.length > 0) && (
            <div className="column is-flex is-flex-direction-column is-align-items-center	">
              <CircularProgress />
              <p>Loading armies...</p>
            </div>
          )}
          <div className="columns is-mobile is-multiline">
            {section(
              _.sortBy(activeArmies, (a) => a.name),
              true
            )}
          </div>
          {(!isLive || router.query.dataSourceUrl) && customArmies?.length > 0 && (
            <>
              <h3>Custom Armies</h3>
              <div className="columns is-multiline">
                {customArmies.map((customArmy: IArmyData, i) => (
                  <div key={i} className="column is-half">
                    <Card
                      elevation={1}
                      className="interactable"
                      style={{
                        backgroundColor: customArmy.official ? "#F9FDFF" : null,
                        borderLeft: customArmy.official
                          ? "2px solid #0F71B4"
                          : null,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        chooseArmy(customArmy);
                      }}
                    >
                      <div className="is-flex is-flex-grow-1 is-align-items-center p-4">
                        <ArmyImage
                          className="mr-2"
                          size="32px"
                          name={customArmy.name}
                          armyData={customArmy}
                        />
                        <div className="is-flex-grow-1">
                          <p className="mb-1" style={{ fontWeight: 600 }}>
                            {customArmy.name}
                          </p>
                          <div
                            className="is-flex"
                            style={{ fontSize: "14px", color: "#666" }}
                          >
                            {customArmy.versionString} by {customArmy.username}
                          </div>
                        </div>
                        <IconButton color="primary">
                          <RightIcon />
                        </IconButton>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <Snackbar
        autoHideDuration={4000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={showSnackbar}
        onClose={() => setShowSnackbar(false)}
      >
        <MuiAlert
          severity="error"
          variant="filled"
          sx={{ background: "#ff7043" }}
        >
          Could not load Army Data.
        </MuiAlert>
      </Snackbar>
    </>
  );
}

function Tile({ army, enabled, onSelect }) {
  return (
    <div
      className="column is-half-mobile is-one-third-tablet"
      style={{ filter: enabled ? null : "saturate(0.25)" }}
    >
      <Card
        elevation={2}
        className={enabled ? "interactable" : null}
        onClick={() => (enabled ? onSelect(army) : null)}
      >
        <div className="mt-2 is-flex is-flex-direction-column is-flex-grow-1">
          <ArmyImage name={army.name} armyData={army} />
          <div className="is-flex is-flex-grow-1 is-align-items-center">
            <div className="is-flex-grow-1">
              <p
                className="my-2"
                style={{
                  fontWeight: 600,
                  textAlign: "center",
                  fontSize: "14px",
                }}
              >
                {army.name}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

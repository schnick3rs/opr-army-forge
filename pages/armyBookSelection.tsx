import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, store } from "../data/store";
import {
  getArmyBookData,
  getArmyBooks,
  IArmyData,
  resetLoadedBooks,
} from "../data/armySlice";
import { useRouter } from "next/router";
import { IconButton, Snackbar, InputAdornment, Input } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { resetList } from "../data/listSlice";
import _ from "lodash";
import { MenuBar } from "../views/components/MenuBar";
import { ArmyBookList } from "../views/armyBookSelection/ArmyBookList";

export default function ArmyBookSelection() {
  const armyState = useSelector((state: RootState) => state.army);
  const dispatch = useDispatch<typeof store.dispatch>();
  const router = useRouter();

  const appendMode = !!router.query["append"];

  const [searchText, setSearchText] = useState("");

  const search = (armies) =>
    armies?.filter((a) => {
      return (
        a.name.toLowerCase().includes(searchText.toLowerCase()) ||
        a.username?.toLowerCase().includes(searchText.toLowerCase())
      );
    });

  const allArmyBooks = armyState.armyBooks ?? [];
  const armyBooks = search(allArmyBooks);

  useEffect(() => {
    async function loadApiArmyBooks() {
      // Redirect to game selection screen if no army selected
      if (!armyState.gameSystem) {
        router.push({ pathname: "gameSystem/", query: router.query }, null, {
          shallow: true,
        });
        return;
      }

      if (!appendMode) {
        dispatch(resetLoadedBooks());
        // Clear any existing units?
        dispatch(resetList());
      }

      if (armyState.armyBooks.length < 1)
        dispatch(getArmyBooks(armyState.gameSystem));
    }

    loadApiArmyBooks();
  }, [armyState.gameSystem, armyState.armyBooks]);

  const officialFactions = _.groupBy(
    armyBooks?.filter((ca) => ca.official && ca.factionName) ?? [],
    (a) => a.factionName
  );

  const officialArmies = armyBooks
    ?.filter((ca) => ca.official && !ca.factionName)
    .concat(
      Object.keys(officialFactions).map((key) => {
        const rootArmy = officialFactions[key].find(x => !x.factionRelation) || officialFactions[key][0];
        return {
          uid: rootArmy.uid,
          name: key,
          factionName: key,
          //factionRelation: officialFactions[key][0].factionRelation,
          official: true,
          // Live if any are live
          isLive: officialFactions[key].reduce(
            (live, next) => live || next.isLive,
            false
          ),
        };
      })
    );

  const officialActiveArmies = officialArmies?.filter((ca) => ca.isLive);

  async function selectArmy(army: IArmyData) {
    const uid = army.uid;
    const navigateToConfig = () => {
      router.push({
        pathname: "/listConfiguration",
        query: { ...router.query },
      });
    };

    dispatch(
      getArmyBookData({
        armyUid: uid,
        gameSystem: armyState.gameSystem,
        reset: !appendMode,
      })
    ).then((res) => {
      navigateToConfig();
    });
  }

  return (
    <>
      <MenuBar
        title="Create a new list"
        onBackClick={() => router.push("/gameSystem")}
        right={
          <SearchBox searchText={searchText} setSearchText={setSearchText} />
        }
      />

      <div className="container">
        <div className="mx-auto p-4">
          <div className="mb-4 has-text-centered is-clearfix">
            <h3 className="is-size-4 pt-4">
              Choose {appendMode ? "another" : "an"} Army Book
            </h3>
          </div>
          <ArmyBookList
            armyBooks={officialActiveArmies}
            onSelect={selectArmy}
          />
        </div>
      </div>
    </>
  );
}

function SearchBox({ searchText, setSearchText }) {
  return (
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
}

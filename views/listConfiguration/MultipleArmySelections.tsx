import {
  Checkbox,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Fragment } from "react";
import { RootState } from "../../data/store";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { getArmyBookData, unloadArmyBook, unloadFaction } from "../../data/armySlice";
import _ from "lodash";

export default function MultipleArmySelections() {
  const dispatch = useDispatch();
  const router = useRouter();
  const armyState = useSelector((state: RootState) => state.army);
  const factions = armyState.selectedFactions;
  const loadedArmyBooks = armyState.loadedArmyBooks;

  const allowRemove =
    _.uniq(loadedArmyBooks.map((x) => x.factionName)).length > 1;

  function addAnotherBook() {
    router.push({
      pathname: "/armyBookSelection",
      query: { ...router.query, append: true },
    });
  }

  return (
    <>
      <Typography className="my-2" fontWeight={600}>
        Selected Army Books
      </Typography>
      <Paper sx={{ background: "rgba(33, 33, 33, 0.08)" }} elevation={0}>
        <List>
          {loadedArmyBooks
            .filter((book) => !book.factionName)
            .map((army) => (
              <ArmyBookSelection
                key={army.uid}
                army={army}
                allowRemove={allowRemove}
              />
            ))}
          {factions.map((faction) => (
            <FactionArmyBookSelection
              key={faction}
              faction={faction}
              allowRemove={allowRemove}
            />
          ))}

          <ListItem disablePadding>
            <ListItemButton color="primary" onClick={addAnotherBook}>
              <ListItemText
                primary={
                  <Typography color="primary" fontWeight={600}>
                    ADD ANOTHER ARMY
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Paper>
    </>
  );
}

function ArmyBookSelection({ army, allowRemove }) {
  const dispatch = useDispatch();

  return (
    <Fragment>
      <ListItem
        secondaryAction={
          allowRemove && (
            <IconButton
              edge="end"
              aria-label="comments"
              color="primary"
              onClick={() => dispatch(unloadArmyBook(army.uid))}
            >
              <CloseIcon />
            </IconButton>
          )
        }
      >
        <ListItemText primary={army.name} />
      </ListItem>
      <Divider />
    </Fragment>
  );
}

function FactionArmyBookSelection({ faction, allowRemove }) {
  const dispatch = useDispatch();

  const armyState = useSelector((state: RootState) => state.army);
  const armyBooks = armyState.armyBooks;
  const loadedArmyBooks = armyState.loadedArmyBooks;
  const factionBooks = armyBooks.filter((book) => book.factionName === faction);
  const factionRelation = factionBooks[1].factionRelation;

  return (
    <>
      <ListItem
        secondaryAction={
          allowRemove && (
            <IconButton
              edge="end"
              aria-label="comments"
              color="primary"
              onClick={() => dispatch(unloadFaction(faction))}
            >
              <CloseIcon />
            </IconButton>
          )
        }
      >
        <ListItemText primary={faction + " " + factionRelation} />
      </ListItem>
      {factionBooks.map((book) => {
        const enabled = loadedArmyBooks.some((x) => x.uid === book.uid);
        const selectSubfaction = () => {
          if (!enabled) {
            dispatch(
              getArmyBookData({
                armyUid: book.uid,
                gameSystem: armyState.gameSystem,
                reset: false,
              })
            );
          } else {
            dispatch(unloadArmyBook(book.uid));
          }
        };
        return (
          <ListItem
            key={book.uid}
            secondaryAction={
              <Checkbox checked={enabled} onClick={selectSubfaction} />
            }
          >
            <ListItemText primary={book.name} sx={{ textIndent: "12px" }} />
          </ListItem>
        );
      })}
      <Divider />
    </>
  );
}

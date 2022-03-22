import {
  Dialog,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleArmyBookSelectionOpen } from "../../data/appSlice";
import { getArmyBookData, getArmyBooks, IArmyData } from "../../data/armySlice";
import { RootState, store } from "../../data/store";
import AddIcon from "@mui/icons-material/Add";

export default function ArmyBookSelection() {
  const appState = useSelector((state: RootState) => state.app);
  const armyState = useSelector((state: RootState) => state.army);
  const dispatch = useDispatch<typeof store.dispatch>();

  useEffect(() => {
    if (armyState.armyBooks?.length < 1) {
      dispatch(getArmyBooks(armyState.gameSystem));
    }
  }, [armyState.armyBooks]);

  const addArmy = (book: IArmyData) => {
    dispatch(
      getArmyBookData({ armyUid: book.uid, gameSystem: armyState.gameSystem })
    ).then((_) => {
      dispatch(toggleArmyBookSelectionOpen(false));
    });
  };

  const notLoadedBooks = armyState.armyBooks?.filter(
    (book) =>
      armyState.loadedArmyBooks.some((lb) => lb.uid === book.uid) === false
  );

  return (
    <Dialog
      onClose={() => dispatch(toggleArmyBookSelectionOpen(false))}
      open={appState.armyBookSelectionOpen}
    >
      <DialogTitle>Add Army Book</DialogTitle>
      <List>
        {notLoadedBooks?.map((book) => (
          <ListItem key={book.uid} divider>
            <ListItemText>{book.name}</ListItemText>
            <IconButton color="primary" onClick={() => addArmy(book)}>
              <AddIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
}

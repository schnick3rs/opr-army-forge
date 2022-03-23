import CircularProgress from "@mui/material/CircularProgress";
import { IArmyData } from "../../data/armySlice";
import _ from "lodash";
import ArmyBookTile from "./ArmyBookTile";

interface ArmyBookListProps {
  armyBooks: IArmyData[];
  onSelect: (army: IArmyData) => void;
}

export function ArmyBookList({ armyBooks, onSelect }: ArmyBookListProps) {
  const sortedArmies = _.sortBy(armyBooks, (a) => a.name);

  return (
    <>
      {!(armyBooks?.length > 0) && (
        <div className="column is-flex is-flex-direction-column is-align-items-center	">
          <CircularProgress />
          <p>Loading armies...</p>
        </div>
      )}
      <div className="columns is-mobile is-multiline">
        {sortedArmies.map((army, index) => (
          <ArmyBookTile key={index} army={army} onSelect={onSelect} enabled />
        ))}
      </div>
    </>
  );
}

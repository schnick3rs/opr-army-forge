import { Button } from "@mui/material";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { updateListSettings } from "../../data/listSlice";

interface EditViewProps {
  armyName: string;
  pointsLimit: number;
}

export default function EditView(props: EditViewProps) {
  const dispatch = useDispatch();
  const router = useRouter();

  const update = () => {
    dispatch(
      updateListSettings({
        name: props.armyName,
        pointsLimit: props.pointsLimit || 0,
      })
    );

    router.back();
  };

  return (
    <Button
      className="mx-auto px-6"
      variant="contained"
      onClick={() => update()}
    >
      Save Changes
    </Button>
  );
}

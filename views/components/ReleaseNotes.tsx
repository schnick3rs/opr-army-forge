import { Card, CardContent, IconButton, Modal } from "@mui/material";
import { Fragment, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../data/store";
import { setOpenReleaseNotes } from "../../data/appSlice";

export const APP_VERSION = "0.5.0";

export default function ReleaseNotes() {
  const open = useSelector((state: RootState) => state.app.openReleaseNotes);
  const dispatch = useDispatch();
  const setOpen = (x) => dispatch(setOpenReleaseNotes(x));

  useEffect(() => {
    const lastVersion = localStorage["lastVersion"];
    const latestVersion = releaseNotes[0].version;

    localStorage["lastVersion"] = latestVersion;

    // Don't show the popup if the user hasn't visited the app before
    // But - show the popup anyway if the latest version was the version release notes were added...
    if (!lastVersion) return;

    if (isVersionGreaterThan(latestVersion, lastVersion)) {
      setOpen(true);
    }
  }, []);

  return (
    <Modal open={open} onClose={() => setOpen(false)} style={{ overflowY: "auto" }}>
      <div className="m-4" style={{ outline: "none" }}>
        <Card className="mx-auto" style={{ maxWidth: "480px" }}>
          <CardContent>
            <div className="is-flex" style={{ alignItems: "center" }}>
              <h2 className="mb-2" style={{ flex: 1, fontWeight: "600", fontSize: "20px" }}>
                Release Notes
              </h2>
              <IconButton onClick={() => setOpen(false)}>
                <CloseIcon />
              </IconButton>
            </div>
            {releaseNotes.map((release) => (
              <Fragment key={release.version}>
                <h3 className="mb-2" style={{ fontWeight: "600" }}>
                  v{release.version} - {release.date}
                </h3>
                <ul className="mb-4">
                  {release.notes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </Fragment>
            ))}
          </CardContent>
        </Card>
      </div>
    </Modal>
  );
}

interface IRelease {
  version: string;
  date: string;
  notes: string[];
}

const releaseNotes: IRelease[] = [
  {
    version: "0.5.0",
    date: "28/04/22",
    notes: [
      "Unit Cards - now merge combined units.",
      "Unit Cards - Unit equipment moved to rules to avoid rule duplication.",
      "'Open a List' screen UX.",
      "Competitive army list validation rules added for mixed armies",
      "Fixed mobile scroll behaviour when dragging rules text.",
      "Added release notes!",
    ],
  },
  {
    version: "0.1.0",
    date: "",
    notes: ["All current content!"],
  },
];

function isVersionGreaterThan(a, b) {
  const splitA = a.split(".");
  const splitB = b.split(".");

  if (parseInt(a[0]) > parseInt(b[0])) return true;
  if (parseInt(a[1]) > parseInt(b[1])) return true;
  if (parseInt(a[2]) > parseInt(b[2])) return true;
  return false;
}

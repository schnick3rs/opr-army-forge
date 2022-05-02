import { Button, Card, CardContent, Modal, TextField, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../data/store";

export default function CloudShareModal() {
  const cloudShare = useSelector((state: RootState) => state.app.cloudShare);
  //army-forge-api.azurewebsites.net/list
  const url = "https://army-forge.onepagerules.com/?cid=" + cloudShare.listId;
  return (
    <Modal open={cloudShare.open} onClose={() => {}}>
      <div style={{ maxWidth: "640px" }} className="mx-auto">
        <Card className="mx-4">
          <CardContent>
            <div className="is-flex">
              <TextField label="Share URL" variant="standard" value={url} style={{ flex: 1 }} />
              <Button className="ml-2 px-4">Copy?</Button>
            </div>
            <div className="is-flex mt-4">
              <TextField
                label="List ID"
                variant="standard"
                value={cloudShare.listId}
                style={{ flex: 1 }}
              />
              <Button className="ml-2 px-4">Close</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Modal>
  );
}

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useEffect, useState } from "react";

const startDialogueSeenKey = "StartDialogueSeen";
const currentStartDialogueValue = "v1.1";

export function FirstTimeModalComponent() {
  const [stateDialogValue, setStateDialogValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setStateDialogValue(localStorage.getItem(startDialogueSeenKey));
    setLoading(false);
  }, [setStateDialogValue, setLoading]);
  const handleClose = () => {
    localStorage.setItem(startDialogueSeenKey, currentStartDialogueValue);
    setStateDialogValue(currentStartDialogueValue);
  };
  return (
    <Dialog
      onClose={handleClose}
      open={!loading && stateDialogValue !== currentStartDialogueValue}
    >
      <DialogTitle>Welcome!</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This simple site is about judging predictions from various novels
          against wikipedia articles. You'll be presented two options for each
          prediction, and must decide if the prediction was accurate or not.
        </DialogContentText>
        <DialogContentText>
          You can also browse the list of predictions in rank order, or submit a
          prediction yourself!
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
}

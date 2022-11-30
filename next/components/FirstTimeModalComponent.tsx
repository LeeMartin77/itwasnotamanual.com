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
const currentStartDialogueValue = "v1.0";

export function FirstTimeModalComponent() {
  const [stateDialogValue, setStateDialogValue] = useState<string | null>(null);
  useEffect(() => {
    setStateDialogValue(localStorage.getItem(startDialogueSeenKey));
  }, [setStateDialogValue]);
  const handleClose = () => {
    localStorage.setItem(startDialogueSeenKey, currentStartDialogueValue);
    setStateDialogValue(currentStartDialogueValue);
  };
  return (
    <Dialog
      onClose={handleClose}
      open={stateDialogValue !== currentStartDialogueValue}
    >
      <DialogTitle>Welcome!</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <p>
            This simple site is about judging predictions from various novels
            against wikipedia articles. You'll be presented two options for each
            prediction, and must decide if the prediction was accurate or not.
          </p>
          <p>
            You can also browse the list of predictions in rank order, or submit
            a prediction yourself!
          </p>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
}

import { Prediction } from "../../types/prediction";
import { PredictionListItemComponent } from "./PredictionListItemComponent";
import { List } from '@mui/material';

export function PredictionListComponent({
  predictions,
}: {
  predictions: Prediction[];
}) {
  return (
    <List>
      {predictions.map((pred, i) => (
          <PredictionListItemComponent key={pred.id} prediction={pred} />
      ))}
    </List>
  );
}
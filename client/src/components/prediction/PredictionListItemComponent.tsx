import { Link } from "react-router-dom";
import { Prediction } from "../../../../types/prediction";
import { ListItem, ListItemButton, ListItemText } from '@mui/material';

interface PredictionSummaryProps {
  prediction: Prediction;
}

export function PredictionListItemComponent({
  prediction,
}: PredictionSummaryProps) {
  return (
    <ListItem>
      <ListItemButton component={Link} to={`/prediction/${prediction.url}`}>
        <ListItemText>{prediction.wiki_title} in {prediction.book_title}</ListItemText>
      </ListItemButton>
    </ListItem>
  );
}

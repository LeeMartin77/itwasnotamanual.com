import { Link } from "react-router-dom";
import { Prediction } from "../../../../types/prediction";
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export function stringifyVoteNumber(rawNum: number): string {
  const num = Math.abs(rawNum);
  if (num < 1000) {
    return num.toString();
  }
  const thousands = Math.floor(num / 1000)
  const hundreds = Math.floor((num - thousands * 1000) / 100)
  return `${thousands}.${hundreds}k`
}

function VoteIndicator({ sortKey }: { sortKey: string }): JSX.Element {
  const splitchar = "~"
  
  const offset = 5000000
  const [number] = sortKey.split(splitchar)
  const parsedVotes = parseInt(number) - offset;
  return <>
    {parsedVotes >= 0 ? <ArrowDropUpIcon style={{ color: "green"}}/> : <ArrowDropDownIcon style={{ color: "red"}}/>} {stringifyVoteNumber(parsedVotes)}
  </>
}

interface PredictionSummaryProps {
  prediction: Prediction;
}

export function PredictionListItemComponent({
  prediction,
}: PredictionSummaryProps) {
  return (
    <ListItem>
      <ListItemButton component={Link} to={`/prediction/${prediction.pageUrl}`}>
        <ListItemIcon><VoteIndicator sortKey={prediction.sort_key}/></ListItemIcon>
        <ListItemText>{prediction.wiki_title} in {prediction.book_title}</ListItemText>
      </ListItemButton>
    </ListItem>
  );
}

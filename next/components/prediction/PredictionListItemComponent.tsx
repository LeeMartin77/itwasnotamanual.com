import Link from "next/link";
import { Prediction } from "../../types/prediction";
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export function stringifyVoteNumber(rawNum: number): string {
  const num = Math.abs(rawNum);
  if (num < 1000) {
    return num.toString();
  }
  const thousands = Math.floor(num / 1000);
  const hundreds = Math.floor((num - thousands * 1000) / 100);
  return `${thousands}.${hundreds}k`;
}

function VoteIndicator({ score }: { score: number }): JSX.Element {
  return (
    <>
      {score >= 0 ? (
        <ArrowDropUpIcon style={{ color: "green" }} />
      ) : (
        <ArrowDropDownIcon style={{ color: "red" }} />
      )}{" "}
      {stringifyVoteNumber(score)}
    </>
  );
}

interface PredictionSummaryProps {
  prediction: Prediction;
}

export function PredictionListItemComponent({
  prediction,
}: PredictionSummaryProps) {
  return (
    <ListItem>
      <ListItemButton
        component={Link}
        href={`/prediction/${prediction.page_url}`}
      >
        <ListItemIcon>
          <VoteIndicator score={prediction.score} />
        </ListItemIcon>
        <ListItemText>
          {prediction.wiki_title} in {prediction.book_title}
        </ListItemText>
      </ListItemButton>
    </ListItem>
  );
}

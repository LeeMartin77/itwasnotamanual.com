import {
  Prediction,
  StoredPrediction,
  StoredPredictionScore,
} from "../types/prediction";
import { PredictionListItemComponent } from "../components/prediction/PredictionListItemComponent";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  List,
  Link,
} from "@mui/material";
import { useState } from "react";
import RouterLink from "next/link";
import { InferGetServerSidePropsType } from "next";
import { CASSANDRA_CLIENT, rowToObject } from "../system/storage";

export const getServerSideProps = async () => {
  const existing = await CASSANDRA_CLIENT.execute(
    `select * 
    from itwasnotamanual.prediction
    LIMIT 1000;`,
    [],
    { prepare: true }
  );
  const existingScores = await CASSANDRA_CLIENT.execute(
    `select page_url, cast(score as int) as score, cast(total_votes as int) as total_votes
    from itwasnotamanual.prediction_score
    LIMIT 1000;`,
    [],
    { prepare: true }
  );

  const mappedPredictions = Object.fromEntries(
    existing.rows.map((r) => {
      const obj = rowToObject(r) as StoredPrediction;
      return [obj.page_url, obj];
    })
  ) as { [key: string]: StoredPrediction };

  const orderedScores = (
    existingScores.rows.map(rowToObject) as StoredPredictionScore[]
  ).sort((a, b) => a.score - b.score);
  return {
    props: {
      mappedPredictions,
      orderedScores,
    },
  };
};

const PAGE_SIZE = 20;

export default function Predictions({
  orderedScores,
  mappedPredictions,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [predictionsToShow, setPredictionsToShow] = useState<number>(PAGE_SIZE);

  return (
    <Card>
      <CardContent sx={{ maxHeight: "70vh", overflowY: "scroll" }}>
        <List>
          {orderedScores.map((pred) => {
            const prediction = {
              ...mappedPredictions[pred.page_url],
              score: pred.score,
              total_votes: pred.total_votes,
            };
            return (
              <PredictionListItemComponent
                key={pred.page_url}
                prediction={prediction}
              />
            );
          })}
        </List>
        {predictionsToShow > orderedScores.length && (
          <Alert severity="info">
            No more predictions:{" "}
            <Link component={RouterLink} href="/submit">
              Why not add one?
            </Link>
          </Alert>
        )}
        {predictionsToShow <= orderedScores.length && (
          <Button
            sx={{ marginLeft: 0, marginRight: 0, width: "100%" }}
            onClick={() => setPredictionsToShow(predictionsToShow + PAGE_SIZE)}
            variant="outlined"
          >
            Show More
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

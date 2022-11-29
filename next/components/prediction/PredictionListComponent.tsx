import { Prediction } from "../../types/prediction";
import { PredictionListItemComponent } from "./PredictionListItemComponent";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  List,
  Link,
} from "@mui/material";
import { useEffect, useState } from "react";
import { getPredictions } from "../../functions/getPredictions";
import RouterLink from "next/link";

export function PredictionListComponent() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [lastEvaluated, setLastEvaluated] = useState<
    { [key: string]: string } | undefined
  >(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const loadMore = () =>
    getPredictions(lastEvaluated)
      .then((pred) => {
        predictions.push(...pred.Items);
        setPredictions(predictions);
        setLastEvaluated(pred.LastEvaluatedKey);
        setLoading(false);
      })
      .catch(() => setError(true));

  useEffect(() => {
    getPredictions(undefined)
      .then((pred) => {
        setPredictions(pred.Items);
        setLastEvaluated(pred.LastEvaluatedKey);
        setLoading(false);
      })
      .catch(() => setError(true));
  }, [setPredictions, setLastEvaluated, setLoading]);

  return (
    <Card>
      <CardContent sx={{ maxHeight: "70vh", overflowY: "scroll" }}>
        <List>
          {predictions.map((pred, i) => (
            <PredictionListItemComponent key={pred.id} prediction={pred} />
          ))}
        </List>
        {error && <Alert severity="error">Error loading predictions</Alert>}
        {loading && <CircularProgress />}
        {!loading && !lastEvaluated && (
          <Alert severity="info">
            No more predictions:{" "}
            <Link component={RouterLink} href="/submit">
              Why not add one?
            </Link>
          </Alert>
        )}
        {lastEvaluated && (
          <Button
            sx={{ marginLeft: 0, marginRight: 0, width: "100%" }}
            onClick={loadMore}
            variant="outlined"
            disabled={loading}
          >
            Load More
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

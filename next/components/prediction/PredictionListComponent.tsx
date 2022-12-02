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
  const [pageNumber, setPageNumber] = useState<number>(2);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const loadMore = () =>
    getPredictions(pageNumber)
      .then((pred) => {
        predictions.push(...pred);
        setPredictions(predictions);
        setPageNumber(pageNumber + 1);
        setLoading(false);
      })
      .catch(() => setError(true));

  useEffect(() => {
    getPredictions(1)
      .then((pred) => {
        setPredictions(pred);
        setLoading(false);
      })
      .catch(() => setError(true));
  }, [setPredictions, setPageNumber, setLoading]);

  return (
    <Card>
      <CardContent sx={{ maxHeight: "70vh", overflowY: "scroll" }}>
        <List>
          {predictions.map((pred, i) => (
            <PredictionListItemComponent
              key={pred.page_url}
              prediction={pred}
            />
          ))}
        </List>
        {error && <Alert severity="error">Error loading predictions</Alert>}
        {loading && <CircularProgress />}
        {!loading && !pageNumber && (
          <Alert severity="info">
            No more predictions:{" "}
            <Link component={RouterLink} href="/submit">
              Why not add one?
            </Link>
          </Alert>
        )}
        {pageNumber && (
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

import { Alert, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { Prediction } from "../../../../types/prediction";
import { getRandomPrediction } from "../../functions/getPredictions";
import { PredictionDetailsComponent } from "./PredictionDetailsComponent";

export function PredictionRankingComponent() {
  const [prediction, setPrediction] = useState<Prediction | undefined>(
    undefined
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    getRandomPrediction()
      .then((pred) => {
        setPrediction(pred);
        setLoading(false);
      })
      .catch(() => setError(true));
  }, [setPrediction, setLoading, setError]);

  return !loading && !error && prediction ? (
    <PredictionDetailsComponent prediction={prediction} hasLink={true} />
  ) : error ? (
    <Alert severity="error">Error loading prediction</Alert>
  ) : (
    <CircularProgress />
  );
}
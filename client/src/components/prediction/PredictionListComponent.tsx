import { Prediction } from "../../types/prediction";
import { PredictionSummaryComponent } from "./PredictionSummaryComponent";

export function PredictionListComponent({
  predictions,
}: {
  predictions: Prediction[];
}) {
  return (
    <>
      {predictions.map((pred) => (
        <PredictionSummaryComponent key={pred.id} prediction={pred} />
      ))}
    </>
  );
}
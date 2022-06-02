import { Link } from "react-router-dom";
import { Prediction } from "../../types/prediction";

interface PredictionSummaryProps {
  prediction: Prediction;
}

export function PredictionSummaryComponent({
  prediction,
}: PredictionSummaryProps) {
  return (
    <div>
      <h3>
        {prediction.wiki_title} in {prediction.book_title}
      </h3>
      <Link
        style={{ display: "block", margin: "1rem 0" }}
        to={`/prediction/${prediction.url}`}
      >
        Details
      </Link>
    </div>
  );
}

import { Prediction } from '../../types/prediction';

interface PredictionSummaryProps {
  prediction: Prediction
}

export function PredictionSummaryComponent({ prediction } : PredictionSummaryProps) {
  return (
    <div>
      <h3>{prediction.wiki_title} in {prediction.book_title}</h3>
    </div>
  );
}

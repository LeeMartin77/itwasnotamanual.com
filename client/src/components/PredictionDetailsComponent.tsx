import { useEffect, useState } from 'react';
import { getPredictionDetails } from '../functions/getPredictionDetails';
import { Prediction, PredictionDetail } from '../types/prediction';

interface PredictionDetailsProps {
  prediction: Prediction
  fnGetPredictionDetails?: (prediction: Prediction) => Promise<PredictionDetail>
}

export function PredictionDetailsComponent({ prediction, fnGetPredictionDetails = getPredictionDetails } : PredictionDetailsProps) {
  const [predictionDetail, setPredictionDetail] = useState<PredictionDetail | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  useEffect(() => {
      fnGetPredictionDetails(prediction).then(details => { setPredictionDetail(details); setLoading(false);}).catch(() => setError(true))
  }, [fnGetPredictionDetails, setPredictionDetail, setLoading, setError, prediction]);
  return (
    <div>
      {loading ? <span>Loading...</span> : 
       error || !predictionDetail ? <span>Error</span> : 
        <div>
          <p>The</p>
          <h1>{predictionDetail.subject.title}</h1>
          <p>was in</p>
          <h1>{predictionDetail.book.title}</h1>
          <p>Written by {predictionDetail.book.authors.map(x => x.personal_name).join(', ')}</p>
          <p>{predictionDetail.quote}</p>
          <img src={predictionDetail.book.cover_url} alt={predictionDetail.book.title + " Cover"} />
          <img src={predictionDetail.subject.image_url} alt={predictionDetail.subject.title + " Image"} />
        </div>}
    </div>
  );
}

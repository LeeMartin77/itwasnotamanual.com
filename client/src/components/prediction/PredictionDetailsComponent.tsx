import { useEffect, useState } from "react";
import {
useNavigate,
} from "react-router-dom";
import { getPredictionDetails } from "../../functions/getPredictionDetails";
import { Prediction, PredictionDetail } from "../../../../types/prediction";
import { Alert, Box, Button, Card, CardActions, CardContent, CardHeader, CircularProgress, Typography } from '@mui/material';

import "./PredictionDetailsComponent.css"

interface PredictionDetailsProps {
  prediction: Prediction;
  random?: boolean;
  fnGetPredictionDetails?: (
    prediction: Prediction
  ) => Promise<PredictionDetail>;
}

export function PredictionDetailsComponent({
  prediction,
  random = false,
  fnGetPredictionDetails = getPredictionDetails,
}: PredictionDetailsProps) {
  const navigate = useNavigate();
  const [predictionDetail, setPredictionDetail] = useState<
    PredictionDetail | undefined
  >(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  
  useEffect(() => {
    fnGetPredictionDetails(prediction)
      .then((details) => {
        setPredictionDetail(details);
        setLoading(false);
      })
      .catch(() => setError(true));
  }, [
    fnGetPredictionDetails,
    setPredictionDetail,
    setLoading,
    setError,
    prediction,
  ]);
  return (
    <Card>
      <CardHeader title={prediction.wiki_title + " in " + prediction.book_title} subheader={!loading && !error && predictionDetail && "Written by " + predictionDetail.book.authors
              .map((x) => x.personal_name)
              .join(", ")}/>
      <CardContent>
          {!prediction.moderated && <Alert style={{marginBottom: 16}} severity="warning">Prediction is awaiting moderation</Alert>}
          {loading && <CircularProgress />}
          {!loading && error && <Alert style={{marginBottom: 16}} severity="error">Error loading details</Alert>}
          {!loading && !error && predictionDetail && <>
          {predictionDetail.subject.image_url && <Box
            className="stacked-prediction-image-box"
          >
            <img className="prediction-subject-img"
            src={predictionDetail.subject.image_url}
            alt={predictionDetail.subject.title + " Image"} />
            {predictionDetail.book.cover_url_md && 
            <img className="prediction-book-stacked-img"
            src={predictionDetail.book.cover_url_md}
            alt={predictionDetail.book.title + " Cover"} />}
            </Box>}
          {!predictionDetail.subject.image_url && predictionDetail.book.cover_url_lg && <Box
            className="cover-only-prediction-image-box"
            >
              <img className="prediction-book-solo-img"
              src={predictionDetail.book.cover_url_lg}
              alt={predictionDetail.book.title + " Cover"}/>
            </Box>}


          { predictionDetail.quote && <Typography style={{paddingTop: 16}} variant="body1">{predictionDetail.quote}</Typography>}
          </>
      }
      </CardContent>
      <CardActions>
        {random ? 
          <Button onClick={() => navigate("/prediction/" + prediction.pageUrl)}>Go to Page</Button> : 
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        }
      </CardActions>
    </Card>
  );
}

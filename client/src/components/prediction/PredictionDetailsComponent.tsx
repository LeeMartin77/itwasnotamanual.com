import { useEffect, useState } from "react";
import {
useNavigate,
} from "react-router-dom";
import { getPredictionDetails } from "../../functions/getPredictionDetails";
import { Prediction, PredictionDetail } from "../../types/prediction";
import { Alert, Box, Button, Card, CardActions, CardContent, CircularProgress, Typography } from '@mui/material';

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
      <CardContent>
          <h1>{prediction.wiki_title} in {prediction.book_title}</h1>
      {loading && <CircularProgress />}
      {!loading && error && <Alert severity="error">Error loading details</Alert>}
      {!loading && !error && predictionDetail && <>
          <h4>
            Written by{" "}
            {predictionDetail.book.authors
              .map((x) => x.personal_name)
              .join(", ")}
          </h4>
          { predictionDetail.quote && <Typography variant="body2">{predictionDetail.quote}</Typography>}
          <Box
            component="img"
            sx={{
              maxHeight: { xs: 233, md: 167 },
              maxWidth: { xs: 350, md: 250 },
            }}
            src={predictionDetail.book.cover_url}
            alt={predictionDetail.book.title + " Cover"}
          />
          <Box
            component="img"
            sx={{
              maxHeight: { xs: 233, md: 167 },
              maxWidth: { xs: 350, md: 250 },
            }}
            src={predictionDetail.subject.image_url}
            alt={predictionDetail.subject.title + " Image"}
          />
          </>
      }
      </CardContent>
      <CardActions>
        {random ? 
          <Button onClick={() => navigate("/prediction/" + prediction.url)}>Go to Page</Button> : 
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        }
      </CardActions>
    </Card>
  );
}

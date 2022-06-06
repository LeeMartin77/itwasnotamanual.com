import { useEffect, useState } from "react";
import {
  useNavigate,
} from "react-router-dom";
import { getPredictionDetails } from "../../functions/getPredictionDetails";
import { Prediction, PredictionDetail } from "../../../../types/prediction";
import { Alert, Box, Button, ButtonGroup, Card, CardActions, CardContent, CardHeader, CircularProgress, Typography } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import "./PredictionDetailsComponent.css"
import { wikipediaLinkFromSlug } from "../../functions/thirdPartyDataAccess/wikipedia";
import { openLibraryLinkFromWorksId } from "../../functions/thirdPartyDataAccess/openlibrary";

interface PredictionDetailsProps {
  prediction: Prediction;
  hasLink?: boolean;
  fnGetPredictionDetails?: (
    prediction: Prediction
  ) => Promise<PredictionDetail>;
}

export function PredictionDetailsComponent({
  prediction,
  hasLink = false,
  fnGetPredictionDetails = getPredictionDetails,
}: PredictionDetailsProps) {
  const navigate = useNavigate();
  const [predictionDetail, setPredictionDetail] = useState<
    PredictionDetail | undefined
  >(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  
  const [isShort, setShort] = useState(window.innerHeight < 720);

  const updateMedia = () => {
    setShort(window.innerHeight < 720);
  };

  useEffect(() => {
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  }, [setShort]);

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
            className={isShort ? "stacked-prediction-image-box-short-screen" : "stacked-prediction-image-box"}
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
            className={isShort ? "cover-only-prediction-image-box-short-screen" : "cover-only-prediction-image-box"}
            >
              <img className={"prediction-book-solo-img"}
              src={predictionDetail.book.cover_url_lg}
              alt={predictionDetail.book.title + " Cover"}/>
            </Box>}


          { predictionDetail.quote && <Typography style={{paddingTop: 16}} variant="body1">{predictionDetail.quote}</Typography>}
          </>
      }
      </CardContent>
      <CardActions style={{display: "flex", flexDirection: "row"}}>
        <ButtonGroup variant="contained">
          <Button href={wikipediaLinkFromSlug(prediction.wiki)} endIcon={<LinkIcon />}>Article</Button>
          <Button href={openLibraryLinkFromWorksId(prediction.openlibraryid)} endIcon={<LinkIcon />}>Book</Button>
        </ButtonGroup>
        {hasLink &&
          <Button onClick={() => navigate("/prediction/" + prediction.pageUrl)} style={{marginLeft: "auto", marginRight:"0"}} variant="outlined">Link</Button>
        }
      </CardActions>
    </Card>
  );
}

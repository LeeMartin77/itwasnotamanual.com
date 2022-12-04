import { ReactElement, useEffect, useState } from "react";
import { getPredictionDetails } from "../../functions/getPredictionDetails";
import { Prediction, PredictionDetail } from "../../types/prediction";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import LinkIcon from "@mui/icons-material/Link";
import Link from "next/link";
import { wikipediaLinkFromSlug } from "../../functions/thirdPartyDataAccess/wikipedia";
import { openLibraryLinkFromWorksId } from "../../functions/thirdPartyDataAccess/openlibrary";

import ShareIcon from "@mui/icons-material/Share";

interface PredictionDetailsProps {
  prediction?: Prediction;
  predictionLoading?: boolean;
  predictionError?: boolean;
  hasLink?: boolean;
  RankingControlComponent?: ReactElement<any, any>;
  fnGetPredictionDetails?: (
    prediction: Prediction
  ) => Promise<PredictionDetail>;
}

export function PredictionDetailsComponent({
  prediction,
  predictionLoading,
  predictionError,
  hasLink = false,
  RankingControlComponent = undefined,
  fnGetPredictionDetails = getPredictionDetails,
}: PredictionDetailsProps) {
  const [predictionDetail, setPredictionDetail] = useState<
    PredictionDetail | undefined
  >(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const [isShort, setShort] = useState(true);

  useEffect(() => {
    const updateMedia = () => {
      setShort(window.innerHeight < 720);
    };
    updateMedia();
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  }, [setShort]);

  useEffect(() => {
    setPredictionDetail(undefined);
    setLoading(true);
    setError(false);
    if (prediction) {
      fnGetPredictionDetails(prediction)
        .then((details) => {
          setPredictionDetail(details);
          setLoading(false);
        })
        .catch(() => setError(true));
    }
  }, [
    fnGetPredictionDetails,
    setPredictionDetail,
    setLoading,
    setError,
    prediction,
  ]);

  const shareButton = prediction && (
    <IconButton
      LinkComponent={Link}
      aria-label="share"
      href={"/prediction/" + prediction.page_url}
      style={{ position: "absolute", bottom: 0, left: 0 }}
    >
      <ShareIcon />
    </IconButton>
  );
  return (
    <>
      <Card>
        <CardHeader
          title={
            prediction
              ? prediction.wiki_title + " in " + prediction.book_title
              : "Loading Prediction"
          }
          subheader={
            !loading && !error
              ? predictionDetail &&
                "Written by " +
                  predictionDetail.book.authors
                    .map((x) => x.personal_name)
                    .join(", ")
              : "Loading author..."
          }
        />
        <CardContent>
          {prediction && !prediction.moderated && (
            <Alert style={{ marginBottom: 16 }} severity="warning">
              Prediction is awaiting moderation
            </Alert>
          )}
          {loading && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                minHeight: "200px",
              }}
            >
              <CircularProgress
                sx={{ marginLeft: "auto", marginRight: "auto" }}
              />
            </Box>
          )}
          {!loading && error && (
            <Alert style={{ marginBottom: 16 }} severity="error">
              Error loading details
            </Alert>
          )}
          {!loading && !error && predictionDetail && (
            <>
              {predictionDetail.subject.image_url && (
                <Box
                  className={
                    isShort
                      ? "stacked-prediction-image-box-short-screen"
                      : "stacked-prediction-image-box"
                  }
                >
                  <img
                    className="prediction-subject-img"
                    src={predictionDetail.subject.image_url}
                    alt={predictionDetail.subject.title + " Image"}
                  />
                  {predictionDetail.book.cover_url_md && (
                    <img
                      className="prediction-book-stacked-img"
                      src={predictionDetail.book.cover_url_md}
                      alt={predictionDetail.book.title + " Cover"}
                    />
                  )}
                  {prediction && hasLink && shareButton}
                </Box>
              )}
              {!predictionDetail.subject.image_url &&
                predictionDetail.book.cover_url_lg && (
                  <Box
                    className={
                      isShort
                        ? "cover-only-prediction-image-box-short-screen"
                        : "cover-only-prediction-image-box"
                    }
                  >
                    <img
                      className={"prediction-book-solo-img"}
                      src={predictionDetail.book.cover_url_lg}
                      alt={predictionDetail.book.title + " Cover"}
                    />
                    {prediction && hasLink && shareButton}
                  </Box>
                )}
            </>
          )}
          {prediction && prediction.quote && (
            <Typography
              style={{ marginTop: 16 }}
              variant="body1"
              className="prediction-quote"
            >
              <FormatQuoteIcon
                className="prediction-quote-start-mark"
                fontSize="small"
              />
              {prediction.quote}
              <FormatQuoteIcon
                className="prediction-quote-end-mark"
                fontSize="small"
              />
            </Typography>
          )}
        </CardContent>
        {RankingControlComponent}
      </Card>
      {prediction && (
        <Card style={{ marginTop: "1rem" }}>
          <CardHeader title={prediction.wiki_title} />
          <CardContent>
            {loading && (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  minHeight: "200px",
                }}
              >
                <CircularProgress
                  sx={{ marginLeft: "auto", marginRight: "auto" }}
                />
              </Box>
            )}
            {predictionDetail && (
              <Typography variant="body1">
                {predictionDetail.subject.extract}
              </Typography>
            )}
          </CardContent>
          <CardActions style={{ display: "flex", flexDirection: "row" }}>
            <Button
              variant="contained"
              href={prediction && wikipediaLinkFromSlug(prediction.wiki)}
              disabled={!prediction}
              endIcon={<LinkIcon />}
            >
              Wikipedia
            </Button>
          </CardActions>
        </Card>
      )}
      {prediction && (
        <Card style={{ marginTop: "1rem" }}>
          <CardHeader title={prediction.book_title} />
          <CardContent>
            {loading && (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  minHeight: "200px",
                }}
              >
                <CircularProgress
                  sx={{ marginLeft: "auto", marginRight: "auto" }}
                />
              </Box>
            )}
            {predictionDetail && (
              <Typography variant="body1">
                {predictionDetail.book.description.split("----")[0]}
              </Typography>
            )}
          </CardContent>
          <CardActions style={{ display: "flex", flexDirection: "row" }}>
            <Button
              variant="contained"
              href={
                prediction &&
                openLibraryLinkFromWorksId(prediction.openlibraryid)
              }
              disabled={!prediction}
              endIcon={<LinkIcon />}
            >
              OpenLibrary
            </Button>
          </CardActions>
        </Card>
      )}
    </>
  );
}

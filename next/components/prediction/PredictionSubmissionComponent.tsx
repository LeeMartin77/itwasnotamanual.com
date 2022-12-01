import {
  Alert,
  AlertColor,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Link,
  TextField,
} from "@mui/material";
import React, { useState } from "react";
import { createPrediction } from "../../functions/createPrediction";
import { checkOpenLibraryValue } from "../../functions/thirdPartyDataAccess/openlibrary";
import { checkWikipediaArticle } from "../../functions/thirdPartyDataAccess/wikipedia";

export function PredictionSubmissionComponent() {
  const [openlibraryid, setOpenlibraryid] = useState<string>("");
  const [wikislug, setWikislug] = useState<string>("");
  const [quote, setQuote] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const quoteLength = 150;
  const [quoteInfo, setQuoteInfo] = useState<{
    message: string;
    type: AlertColor;
  }>({
    message: `Optional: Must be under ${quoteLength} characters`,
    type: "info",
  });
  const [checking, setChecking] = useState([false, false]);

  const [openlibtimeout, setOpenLibTimeout] = useState<
    NodeJS.Timeout | undefined
  >(undefined);
  const [openlibInfo, setOpenLibInfo] = useState<{
    message: string | JSX.Element;
    type: AlertColor;
  }>({
    message: (
      <Link href="https://openlibrary.org/search">Open Library Link</Link>
    ),
    type: "info",
  });

  const [wikitimeout, setWikiTimeout] = useState<NodeJS.Timeout | undefined>(
    undefined
  );
  const [wikiInfo, setWikiInfo] = useState<{
    message: string | JSX.Element;
    type: AlertColor;
  }>({
    message: (
      <Link href="https://en.wikipedia.org/wiki/Special:Search">
        Wikipedia Link
      </Link>
    ),
    type: "info",
  });

  const handleOpenLibId = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (openlibtimeout) {
      clearTimeout(openlibtimeout);
    }
    const wiki = checking[1];
    setChecking([true, wiki]);
    setOpenlibraryid(event.target.value);
    setOpenLibInfo({ message: "Checking...", type: "info" });
    setOpenLibTimeout(
      setTimeout(() => {
        checkOpenLibraryValue(event.target.value)
          .then(([value, bookData]) => {
            setOpenlibraryid(value);
            setOpenLibInfo({ message: bookData.title, type: "success" });
          })
          .catch((err: any) => {
            setOpenLibInfo({ message: err.message, type: "error" });
          })
          .finally(() => {
            const wiki = checking[1];
            setChecking([false, wiki]);
          });
      }, 500)
    );
  };

  const handleWikislug = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (wikitimeout) {
      clearTimeout(wikitimeout);
    }
    setWikislug(event.target.value);
    const open = checking[0];
    setChecking([open, true]);
    setWikiInfo({ message: "Checking...", type: "info" });
    setWikiTimeout(
      setTimeout(() => {
        checkWikipediaArticle(event.target.value)
          .then(([value, wikiData]) => {
            setWikislug(value);
            setWikiInfo({ message: wikiData.title, type: "success" });
          })
          .catch((err: any) => {
            setWikiInfo({ message: err.message, type: "error" });
          })
          .finally(() => {
            const open = checking[0];
            setChecking([open, false]);
          });
      }, 500)
    );
  };

  const handleQuote = (event: React.ChangeEvent<HTMLInputElement>) => {
    const message = `Must be under ${quoteLength} characters`;
    if (event.target.value.length > 150) {
      setQuoteInfo({ message, type: "error" });
    } else if (event.target.value.length > 0) {
      setQuoteInfo({ message, type: "success" });
    } else {
      setQuoteInfo({ message: "Optional: " + message, type: "info" });
    }
    setQuote(event.target.value);
  };

  const handleSubmission = () => {
    setError(undefined);
    setSubmitting(true);
    if (wikislug && openlibraryid) {
      createPrediction({
        openlibraryid,
        wiki: wikislug,
        quote: quote || undefined,
      })
        .then((prediction) => {
          window.location.assign("/prediction/" + prediction.page_url);
        })
        .catch((err) => {
          setError(err.message);
          setSubmitting(false);
        });
    } else {
      setSubmitting(false);
      setError("Missing OpenLibraryId or Wikipedia Slug");
    }
  };
  return (
    <Card
      sx={{
        width: "100%",
      }}
    >
      <CardHeader title="Submit a Prediction" />
      <CardContent>
        {error && (
          <Alert sx={{ width: "100%", marginBottom: 2 }} severity="error">
            {error}
          </Alert>
        )}
        {!submitting && (
          <>
            <TextField
              value={openlibraryid}
              onChange={handleOpenLibId}
              sx={{ width: "100%" }}
              id="openlibraryid"
              label="Open Library Works Id or Url"
              variant="filled"
              required
            />
            <Alert sx={{ marginBottom: 2 }} severity={openlibInfo.type}>
              {openlibInfo.message}
            </Alert>

            <TextField
              value={wikislug}
              onChange={handleWikislug}
              sx={{
                width: "100%",
                marginTop: openlibInfo === undefined ? 2 : 0,
                marginBottom: wikiInfo === undefined ? 2 : 0,
              }}
              id="wiki"
              label="Wikipedia Page Slug or Url"
              variant="filled"
              required
            />
            <Alert sx={{ marginBottom: 2 }} severity={wikiInfo.type}>
              {wikiInfo.message}
            </Alert>

            <TextField
              value={quote}
              onChange={handleQuote}
              sx={{ width: "100%" }}
              id="quote"
              label="Quote"
              variant="filled"
              multiline
            />
          </>
        )}
        <Alert sx={{ marginBottom: 2 }} severity={quoteInfo.type}>
          {quoteInfo.message}
        </Alert>
        {submitting && <CircularProgress />}
        {!submitting && (
          <Button
            sx={{ marginLeft: 0, marginRight: 0, width: "100%" }}
            onClick={handleSubmission}
            variant="contained"
            disabled={
              checking.includes(true) ||
              openlibInfo.type !== "success" ||
              wikiInfo.type !== "success" ||
              quoteInfo.type === "error"
            }
          >
            Submit
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

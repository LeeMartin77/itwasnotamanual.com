
import { Alert, Button, Card, CardActions, CardContent, CardHeader, CircularProgress, TextField } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPrediction } from '../../functions/createPrediction';
import { checkOpenLibraryValue } from '../../functions/thirdPartyDataAccess/openlibrary';
import { checkWikipediaArticle } from '../../functions/thirdPartyDataAccess/wikipedia';
import "./PredictionSubmissionComponent.css"

export function PredictionSubmissionComponent() {

  const navigate = useNavigate();
  
  const [openlibraryid, setOpenlibraryid] = useState<string>("");
  const [wikislug, setWikislug] = useState<string>("");
  const [quote, setQuote] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const [openlibtimeout, setOpenLibTimeout] = useState<NodeJS.Timeout | undefined>(undefined);
  const [openlibInfo, setOpenLibInfo] = useState<{message: string, error: boolean} | undefined>(undefined);

  const [wikitimeout, setWikiTimeout] = useState<NodeJS.Timeout | undefined>(undefined);
  const [wikiInfo, setWikiInfo] = useState<{message: string, error: boolean} | undefined>(undefined);

  const handleOpenLibId = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (openlibtimeout) { clearTimeout(openlibtimeout) }
    setOpenlibraryid(event.target.value)
    setOpenLibTimeout(setTimeout(() => {
      checkOpenLibraryValue(event.target.value)
        .then(([value, bookData]) => {
          setOpenlibraryid(value)
          setOpenLibInfo({ message: bookData.title, error: false })
        })
        .catch((err: any) => {
          setOpenLibInfo({ message: err.message, error: true })
        })
    }, 500))
  }

  const handleWikislug = (event: React.ChangeEvent<HTMLInputElement>) => { 
    if (wikitimeout) { clearTimeout(wikitimeout) }
    setWikislug(event.target.value)
    setWikiTimeout(setTimeout(() => {
      checkWikipediaArticle(event.target.value)
        .then(([value, wikiData]) => {
          setWikislug(value)
          setWikiInfo({ message: wikiData.title, error: false })
        })
        .catch((err: any) => {
          setWikiInfo({ message: err.message, error: true })
        })
    }, 500))  }
  const handleQuote = (event: React.ChangeEvent<HTMLInputElement>) => setQuote(event.target.value)


  const handleSubmission = () => {
    setError(undefined);
    setSubmitting(true);
    setOpenLibInfo(undefined);
    if (wikislug && openlibraryid) {
      createPrediction({
        openlibraryid,
        wiki: wikislug,
        quote: quote || undefined
      }).then(prediction => {
        navigate("/prediction/"+prediction.pageUrl)
      })
      .catch(err => {
        setError(err.message)
        setSubmitting(false)
      })
    } else {
      setSubmitting(false)
      setError("Missing OpenLibraryId or Wikipedia Slug")
    }
  }
  return (
    <Card sx={{
      width: "100%"
    }}>
      <CardHeader title="Submit a Prediction" />
      <CardContent>
        {error && <Alert sx={{ width: "100%", marginBottom: 2 }} severity="error">{error}</Alert>}
        {!submitting && <><TextField 
          value={openlibraryid}
          onChange={handleOpenLibId}
          sx={{ width: "100%" }} 
          id="openlibraryid" 
          label="Open Library Works Id or Url" 
          variant="filled"
          required/>
        {openlibInfo && <Alert sx={{ width: "100%", marginBottom: 2 }} severity={openlibInfo.error ? "error" : "success"}>{openlibInfo.message}</Alert>}

        <TextField 
          value={wikislug}
          onChange={handleWikislug} 
          sx={{ width: "100%", marginTop: openlibInfo === undefined ? 2 : 0, marginBottom: wikiInfo === undefined ? 2 : 0 }} 
          id="wiki" 
          label="Wikipedia Page Slug or Url" 
          variant="filled" 
          required/>
        {wikiInfo && <Alert sx={{ width: "100%", marginBottom: 2 }} severity={wikiInfo.error ? "error" : "success"}>{wikiInfo.message}</Alert>}
  
        <TextField 
          value={quote}
          onChange={handleQuote} 
          sx={{ width: "100%" }} 
          id="quote" 
          label="Quote" 
          variant="filled" 
          multiline/></>}
        {submitting && <CircularProgress />}
      </CardContent>
      <CardActions>
        {!submitting && <Button onClick={handleSubmission} disabled={!openlibInfo || openlibInfo.error || !wikiInfo || wikiInfo.error}>Submit</Button>}
      </CardActions>
    </Card>)
}
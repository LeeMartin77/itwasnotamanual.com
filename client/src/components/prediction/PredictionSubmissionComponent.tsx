
import { Alert, Button, Card, CardActions, CardContent, CardHeader, CircularProgress, TextField } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPrediction } from '../../functions/createPrediction';
import "./PredictionSubmissionComponent.css"

export function PredictionSubmissionComponent() {

  const navigate = useNavigate();
  
  const [openlibraryid, setOpenlibraryid] = useState<string>("");
  const [wikislug, setWikislug] = useState<string>("");
  const [quote, setQuote] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleOpenLibId = (event: React.ChangeEvent<HTMLInputElement>) => setOpenlibraryid(event.target.value)
  const handleWikislug = (event: React.ChangeEvent<HTMLInputElement>) => setWikislug(event.target.value)
  const handleQuote = (event: React.ChangeEvent<HTMLInputElement>) => setQuote(event.target.value)


  const handleSubmission = () => {
    setError(undefined);
    setSubmitting(true);
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
          label="Open Library Id" 
          variant="filled" 
          required/>
        <TextField 
          value={wikislug}
          onChange={handleWikislug} 
          sx={{ width: "100%", marginTop: 2, marginBottom: 2 }} 
          id="wiki" 
          label="Wikipedia Page Slug" 
          variant="filled" 
          required/>
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
        {!submitting && <Button onClick={handleSubmission}>Submit</Button>}
      </CardActions>
    </Card>)
}
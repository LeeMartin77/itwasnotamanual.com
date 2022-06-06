import { Alert, Button, Card, CardActions, CircularProgress } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { Prediction } from "../../../../types/prediction";
import { getPredictionVoteOrRandom, submitVote } from "../../functions/getPredictions";
import { PredictionDetailsComponent } from "./PredictionDetailsComponent";
import { v4 as randomUUID } from "uuid";

import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';

const userIdIdentifier = "itwasntamanualUserId";

function VoteControls(
  {userId, voteToken, canVote, loading, voteCallback, refreshCallback }: {userId: string, voteToken: string | undefined, canVote: boolean, loading: boolean
  voteCallback: (userId: string, voteToken: string, positive: boolean) => any
  refreshCallback: () => any
  }
  ) {

    const choices ={
      positive: {
        label: "Approve",
        onClick: () => voteCallback(userId, voteToken!, true),
        icon: CheckCircleIcon
      },
      negative: {
        label: "Disagree",
        onClick: () => voteCallback(userId, voteToken!, false),
        icon: CancelIcon
      },
      refresh: {
        label: "Refresh",
        onClick: () => refreshCallback(),
        icon: RefreshIcon
      }
    }
    if (!loading && canVote && voteToken) {
      return <Card style={{marginTop: "1rem"}}>
        <CardActions style={{display:"flex"}}>
          <Button onClick={choices.negative.onClick} endIcon={<choices.negative.icon />} variant="outlined" color="error">{choices.negative.label}</Button>
          <Button onClick={choices.positive.onClick} startIcon={<choices.positive.icon />} style={{marginLeft: "auto", marginRight: "0"}} variant="outlined" color="success">{choices.positive.label}</Button>
        </CardActions>
      </Card>
    }
    if (!loading && (!canVote || !voteToken)) {
      return <Card>
        <CardActions style={{display: "flex"}}>
        <Button onClick={choices.refresh.onClick} startIcon={<choices.refresh.icon />} style={{marginLeft: "auto", marginRight: "auto", width: "100%"}} variant="outlined">{choices.refresh.label}</Button>
        </CardActions>
      </Card>
    }
    return <></>
}

export function PredictionRankingComponent() {
  const storageUserId = localStorage.getItem(userIdIdentifier)
  const userId = storageUserId || randomUUID()
  if (!storageUserId) {
    localStorage.setItem(userIdIdentifier, userId)
  }
  const [prediction, setPrediction] = useState<Prediction | undefined>(
    undefined
  );
  const [voteToken, setVoteToken] = useState<string | undefined>(
    undefined
  );
  const [canVote, setCanVote] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const voteCallback = (userId: string, voteToken: string, positive: boolean) => {
    setLoading(true)
    submitVote({ userIdentifier: userId, voteToken, pageUrl: prediction!.pageUrl, positive })
    .then(() => {
      loadPredictionVote()
    }).catch(() => {
      loadPredictionVote()
    })
  }
  
  const loadPredictionVote = useCallback(() => {
    setLoading(true);
    setError(false);
    return getPredictionVoteOrRandom(userId)
      .then(({ prediction, voteToken, hasVote }) => {
        setPrediction(prediction);
        setVoteToken(voteToken);
        setCanVote(hasVote)
        setLoading(false);
      })
      .catch(() => setError(true));
  }, [setPrediction, setLoading, setError, setVoteToken, setCanVote, userId])

  useEffect(() => {
    loadPredictionVote()
  }, [loadPredictionVote]);

  return <>{!loading && !error && prediction ? (
    <PredictionDetailsComponent prediction={prediction} hasLink={true} />
  ) : error ? (
    <Alert severity="error">Error loading prediction</Alert>
  ) : (
    <CircularProgress />
  )}
  <VoteControls 
    userId={userId} 
    voteToken={voteToken}
    canVote={canVote}
    loading={loading}
    voteCallback={voteCallback}
    refreshCallback={loadPredictionVote}
  />
  </>;
}
import { Alert, BottomNavigation, BottomNavigationAction, CircularProgress } from "@mui/material";
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
        label: "Yes",
        onClick: () => voteCallback(userId, voteToken!, true),
        icon: CheckCircleIcon
      },
      negative: {
        label: "No",
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
      return <BottomNavigation showLabels>
        <BottomNavigationAction label={choices.negative.label} onClick={choices.negative.onClick} icon={<choices.negative.icon />} />
        <BottomNavigationAction label={choices.positive.label} onClick={choices.positive.onClick} icon={<choices.positive.icon />} />
      </BottomNavigation>
    }
    if (!loading && !canVote) {
      return <BottomNavigation showLabels>
        <BottomNavigationAction label={choices.refresh.label} onClick={choices.refresh.onClick} icon={<choices.refresh.icon />} />
      </BottomNavigation>
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
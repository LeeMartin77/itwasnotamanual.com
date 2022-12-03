import { Button, Card, CardActions } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { Prediction } from "../../types/prediction";
import {
  deleteVote,
  getPredictionVoteOrRandom,
  submitVote,
} from "../../functions/getPredictions";
import { PredictionDetailsComponent } from "./PredictionDetailsComponent";
import { v4 as randomUUID } from "uuid";

import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RefreshIcon from "@mui/icons-material/Refresh";
import SkipNextIcon from "@mui/icons-material/SkipNext";

const userIdIdentifier = "itwasntamanualUserId";

function VoteControls({
  userId,
  vote_token,
  canVote,
  loading,
  voteCallback,
  refreshCallback,
}: {
  userId: string;
  vote_token: string | undefined;
  canVote: boolean;
  loading: boolean;
  voteCallback: (
    userId: string,
    vote_token: string,
    positive: boolean | undefined
  ) => any;
  refreshCallback: () => any;
}) {
  const choices = {
    positive: {
      label: "Approve",
      onClick: () => voteCallback(userId, vote_token!, true),
      icon: CheckCircleIcon,
    },
    skip: {
      label: "Skip",
      onClick: () => voteCallback(userId, vote_token!, undefined),
      icon: SkipNextIcon,
    },
    negative: {
      label: "Disagree",
      onClick: () => voteCallback(userId, vote_token!, false),
      icon: CancelIcon,
    },
    refresh: {
      label: "Refresh",
      onClick: () => refreshCallback(),
      icon: RefreshIcon,
    },
  };
  if (canVote && vote_token) {
    return (
      <Card style={{ marginTop: "1rem", width: "100%" }}>
        <CardActions style={{ display: "flex" }}>
          <Button
            onClick={choices.negative.onClick}
            endIcon={<choices.negative.icon />}
            style={{ marginLeft: "0", marginRight: "auto" }}
            disabled={loading}
            variant="outlined"
            color="error"
          >
            {choices.negative.label}
          </Button>
          <Button
            onClick={choices.skip.onClick}
            disabled={loading}
            style={{ marginLeft: "auto", marginRight: "auto" }}
            variant="text"
            color="info"
          >
            {choices.skip.label}
          </Button>
          <Button
            onClick={choices.positive.onClick}
            startIcon={<choices.positive.icon />}
            style={{ marginLeft: "auto", marginRight: "0" }}
            disabled={loading}
            variant="outlined"
            color="success"
          >
            {choices.positive.label}
          </Button>
        </CardActions>
      </Card>
    );
  }
  return (
    <Card style={{ marginTop: "1rem", width: "100%" }}>
      <CardActions style={{ display: "flex", width: "100%" }}>
        <Button
          onClick={choices.refresh.onClick}
          startIcon={<choices.refresh.icon />}
          style={{ marginLeft: "auto", marginRight: "auto", width: "100%" }}
          disabled={loading}
          variant="outlined"
        >
          {choices.refresh.label}
        </Button>
      </CardActions>
    </Card>
  );
}

export function PredictionRankingComponent() {
  const [userId, setUserId] = useState<null | string>(null);
  useEffect(() => {
    const storageUserId = localStorage.getItem(userIdIdentifier);
    const luserId = storageUserId || randomUUID();
    if (!storageUserId) {
      localStorage.setItem(userIdIdentifier, luserId);
    }
    setUserId(luserId);
  }, [setUserId]);
  const [prediction, setPrediction] = useState<Prediction | undefined>(
    undefined
  );
  const [vote_token, setvote_token] = useState<string | undefined>(undefined);
  const [canVote, setCanVote] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const voteCallback = (
    userId: string,
    vote_token: string,
    positive: boolean | undefined
  ) => {
    setLoading(true);
    const promise =
      positive === undefined
        ? deleteVote({ userIdentifier: userId, vote_token })
        : submitVote({
            userIdentifier: userId,
            vote_token,
            page_url: prediction!.page_url,
            positive,
          });
    promise
      .then(() => {
        loadPredictionVote();
      })
      .catch(() => {
        loadPredictionVote();
      });
  };

  const loadPredictionVote = useCallback(() => {
    setLoading(true);
    setError(false);
    if (userId) {
      return getPredictionVoteOrRandom(userId)
        .then(({ prediction, vote_token, has_vote }) => {
          setPrediction(prediction);
          setvote_token(vote_token);
          setCanVote(has_vote);
          setLoading(false);
        })
        .catch(() => setError(true));
    }
  }, [setPrediction, setLoading, setError, setvote_token, setCanVote, userId]);

  useEffect(() => {
    loadPredictionVote();
  }, [loadPredictionVote]);

  return (
    <>
      <PredictionDetailsComponent
        prediction={prediction}
        hasLink={true}
        predictionLoading={loading || !userId}
        predictionError={error}
        RankingControlComponent={
          <VoteControls
            userId={userId!}
            vote_token={vote_token}
            canVote={canVote}
            loading={loading}
            voteCallback={voteCallback}
            refreshCallback={loadPredictionVote}
          />
        }
      />
    </>
  );
}

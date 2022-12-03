import { Prediction } from "../types/prediction";

const API_ROOT_URL = "/api";

interface PaginatedResult<T> {
  Items: T[];
  LastEvaluatedKey?: { [key: string]: string };
}

interface VoteResult {
  prediction: Prediction;
  vote_token: string | undefined;
  has_vote: boolean;
}

export async function getPredictions(
  pageNumber: number = 1,
  pageLength: number = 20
): Promise<Prediction[]> {
  let predictionsUrl =
    API_ROOT_URL +
    `/predictions?pageNumber=${pageNumber}&pageLength=${pageLength}`;
  const response = await fetch(predictionsUrl);
  if (!response.ok) {
    throw Error("Something went wrong");
  }
  return await response.json();
}

export async function getPredictionFromUrl(
  predictionUrl: string
): Promise<Prediction> {
  const response = await fetch(API_ROOT_URL + "/prediction/" + predictionUrl);
  if (!response.ok) {
    throw Error("Something went wrong");
  }
  return await response.json();
}

// This being an OR is a bit weird, but we'll go with it
export async function getPredictionVoteOrRandom(
  userIdentifier: string
): Promise<VoteResult> {
  const response = await fetch(API_ROOT_URL + "/predictionvote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userIdentifier }),
  });
  if (!response.ok) {
    throw Error("Something went wrong");
  }
  return await response.json();
}

export async function submitVote({
  userIdentifier,
  vote_token,
  page_url,
  positive,
}: {
  userIdentifier: string;
  vote_token: string;
  page_url: string;
  positive: boolean;
}): Promise<void> {
  const response = await fetch(API_ROOT_URL + "/predictionvote/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userIdentifier, vote_token, page_url, positive }),
  });
  if (!response.ok) {
    throw Error("Something went wrong");
  }
}

export async function deleteVote({
  userIdentifier,
  vote_token,
}: {
  userIdentifier: string;
  vote_token: string;
}): Promise<void> {
  const response = await fetch(API_ROOT_URL + "/predictionvote/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userIdentifier, vote_token }),
  });
  if (!response.ok) {
    throw Error("Something went wrong");
  }
}

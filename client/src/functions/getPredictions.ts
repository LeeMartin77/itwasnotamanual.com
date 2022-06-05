import { Prediction } from "../../../types/prediction";

const API_ROOT_URL = process.env.REACT_APP_API_ROOT_URL || "https://api.itwasntamanual.com"

interface PaginatedResult<T> {
  Items: T[],
  LastEvaluatedKey?: any
}

interface VoteResult {
  prediction: Prediction,
  voteToken: string | undefined,
  hasVote: boolean
}

export async function getPredictions(): Promise<PaginatedResult<Prediction>> {
  const response = await fetch(API_ROOT_URL + '/predictions');
  if (!response.ok) {
    throw Error("Something went wrong")
  }
  return await response.json();
}

async function getRandomPrediction(): Promise<Prediction> {
  const response = await fetch(API_ROOT_URL + '/prediction/random');
  if (!response.ok) {
    throw Error("Something went wrong")
  }
  return await response.json();
}

export async function getPredictionFromUrl(
  predictionUrl: string
): Promise<Prediction> {
  const response = await fetch(API_ROOT_URL + '/prediction/' + predictionUrl);
  if (!response.ok) {
    throw Error("Something went wrong")
  }
  return await response.json();
}

// This being an OR is a bit weird, but we'll go with it
export async function getPredictionVoteOrRandom(userIdentifier: string): Promise<VoteResult> {
  // TODO this needs to call the actual endpoint with a post request
  const prediction = await getRandomPrediction()
  return {
    prediction,
    voteToken: "7e476c03-8aa6-4676-eq34-e24ca27710a8",
    hasVote: true
  }
}

export async function submitVote({userIdentifier, voteToken, pageUrl, positive}: { userIdentifier: string, voteToken: string, pageUrl: string, positive: boolean } ): Promise<void> {
  // TODO this needs to call the actual endpoint with a post request
  console.log("Submitted: ", {userIdentifier, voteToken, pageUrl, positive})
}
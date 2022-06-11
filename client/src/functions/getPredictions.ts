import { Prediction } from "../../../types/prediction";

const API_ROOT_URL = process.env.REACT_APP_API_ROOT_URL || "https://api.itwasnotamanual.com"

interface PaginatedResult<T> {
  Items: T[],
  LastEvaluatedKey?: {[key: string]: string}
}

interface VoteResult {
  prediction: Prediction,
  voteToken: string | undefined,
  hasVote: boolean
}

export async function getPredictions(lastEvaluated: {[key: string]: string} | undefined = undefined): Promise<PaginatedResult<Prediction>> {
  let predictionsUrl = API_ROOT_URL + '/predictions';
  if (lastEvaluated) {
    predictionsUrl += "?" + Object.keys(lastEvaluated).map(k => k + "=" + encodeURI(lastEvaluated[k])).join("&")
  }
  const response = await fetch(predictionsUrl);
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
  const response = await fetch(API_ROOT_URL + '/predictionvote', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ userIdentifier })
  });
  if (!response.ok) {
    throw Error("Something went wrong")
  }
  return await response.json();
}

export async function submitVote({userIdentifier, voteToken, pageUrl, positive}: { userIdentifier: string, voteToken: string, pageUrl: string, positive: boolean } ): Promise<void> {
  const response = await fetch(API_ROOT_URL + '/predictionvote/submit', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({userIdentifier, voteToken, pageUrl, positive})
  });
  if (!response.ok) {
    throw Error("Something went wrong")
  }
}


export async function deleteVote({userIdentifier, voteToken}: { userIdentifier: string, voteToken: string} ): Promise<void> {
  const response = await fetch(API_ROOT_URL + '/predictionvote/delete', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({userIdentifier, voteToken})
  });
  if (!response.ok) {
    throw Error("Something went wrong")
  }
}
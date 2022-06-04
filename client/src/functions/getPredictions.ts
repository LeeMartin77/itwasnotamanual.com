import { Prediction } from "../../../types/prediction";

const API_ROOT_URL = process.env.REACT_APP_API_ROOT_URL || "https://api.itwasntamanual.com"

interface PaginatedResult<T> {
  Items: T[],
  LastEvaluatedKey?: any
}

export async function getPredictions(): Promise<PaginatedResult<Prediction>> {
  const response = await fetch(API_ROOT_URL + '/predictions');
  if (!response.ok) {
    throw Error("Something went wrong")
  }
  return await response.json();
}

export async function getRandomPrediction(): Promise<Prediction> {
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
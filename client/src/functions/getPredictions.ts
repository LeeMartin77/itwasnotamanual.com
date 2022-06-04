import { Prediction } from "../../../types/prediction";

const API_ROOT_URL = process.env.REACT_APP_API_ROOT_URL || "https://api.itwasntamanual.com"

interface PaginatedResult<T> {
  Items: T[],
  LastEvaluatedKey?: any
}

export async function getPredictions(): Promise<PaginatedResult<Prediction>> {
  return await(await fetch(API_ROOT_URL + '/predictions')).json()
}

export async function getRandomPrediction(): Promise<Prediction> {
  return await(await fetch(API_ROOT_URL + '/prediction/random')).json()
}

export async function getPredictionFromUrl(
  predictionUrl: string
): Promise<Prediction> {
  return await(await fetch(API_ROOT_URL + '/prediction/' + predictionUrl)).json()
}
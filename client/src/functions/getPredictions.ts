import { Prediction } from "../types/prediction";
import { fakePredictions } from "./fakePredictions";

export async function getPredictions(): Promise<Prediction[]> {
  // TODO: This will be on a server
  return fakePredictions;
}

export async function getRandomPrediction(): Promise<Prediction> {
  // TODO: This will be on a server
  const prediction = fakePredictions[Math.floor(Math.random() * fakePredictions.length)];
  console.log(prediction)
  return prediction;
}

export async function getPredictionFromUrl(
  predictionUrl: string
): Promise<Prediction> {
  // TODO: This will be on a server
  const prediction = fakePredictions.find((x) => x.url === predictionUrl);
  if (prediction) {
    return prediction;
  }
  throw Error("Prediction not found");
}
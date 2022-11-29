import { Prediction } from "../types/prediction";

const API_ROOT_URL = "/api";

interface IPredictionSubmission {
  openlibraryid: string;
  wiki: string;
  quote?: string;
}

export async function createPrediction(
  submission: IPredictionSubmission
): Promise<Prediction> {
  const response = await fetch(API_ROOT_URL + "/prediction", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(submission),
  });
  if (!response.ok) {
    const errorBody = await response.json();
    throw Error(errorBody.message);
  }
  return response.json();
}

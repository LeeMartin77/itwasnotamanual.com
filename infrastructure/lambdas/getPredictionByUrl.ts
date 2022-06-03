import { APIGatewayProxyEventV2, Callback, Context } from "aws-lambda";
import { corsOrigins } from "../util/configuration";
import { fakePredictions } from "./shared/fakePredictions";
import { formatResponse } from "./shared/formatResponse";

export async function main (
  event: APIGatewayProxyEventV2,
  _context: Context,
  _callback: Callback
): Promise<any> { 
  if (!event.pathParameters || !event.pathParameters.predictionUrl) { 
    return formatResponse({}, 500)
  }
  const { predictionUrl } = event.pathParameters;
  const prediction = fakePredictions.find((x) => x.url === predictionUrl);
  if (prediction) {
    return formatResponse(prediction);
  }
  return formatResponse({}, 404)
}

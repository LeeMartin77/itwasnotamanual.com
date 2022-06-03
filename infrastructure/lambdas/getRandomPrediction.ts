import { APIGatewayProxyEventV2, Callback, Context } from "aws-lambda";
import { fakePredictions } from "./shared/fakePredictions";
import { formatResponse } from "./shared/formatResponse";

export async function main (
  _event: APIGatewayProxyEventV2,
  _context: Context,
  _callback: Callback
): Promise<any> { 
  const prediction = fakePredictions[Math.floor(Math.random() * fakePredictions.length)];
  return formatResponse(prediction);}
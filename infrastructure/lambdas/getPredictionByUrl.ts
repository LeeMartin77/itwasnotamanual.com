import { APIGatewayProxyEventV2, Callback, Context } from "aws-lambda";
import { formatResponse } from "./shared/formatResponse";
import { getDynamoPredictionFrompage_url } from "./shared/getDynamoPredictionFrompage_url";

import { mapDynamoToObject } from "./shared/mapDynamoToObject";

export async function main(
  event: APIGatewayProxyEventV2,
  _context: Context,
  _callback: Callback
): Promise<any> {
  if (!event.pathParameters || !event.pathParameters.predictionUrl) {
    return formatResponse({}, 500);
  }
  const { predictionUrl } = event.pathParameters;

  try {
    const prediction = await getDynamoPredictionFrompage_url(predictionUrl);
    if (prediction) {
      return formatResponse(mapDynamoToObject(prediction));
    }
    return formatResponse({}, 404);
  } catch (ex: any) {
    console.error(ex);
    return formatResponse({}, 500);
  }
}

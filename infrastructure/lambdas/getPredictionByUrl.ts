import { APIGatewayProxyEventV2, Callback, Context } from "aws-lambda";
import { formatResponse } from "./shared/formatResponse";

import * as AWS from "aws-sdk";
import { mapDynamoToObject } from "./shared/mapDynamoToObject";

const dynamo = new AWS.DynamoDB();

export async function main (
  event: APIGatewayProxyEventV2,
  _context: Context,
  _callback: Callback
): Promise<any> { 
  if (!event.pathParameters || !event.pathParameters.predictionUrl) { 
    return formatResponse({}, 500)
  }
  const { predictionUrl } = event.pathParameters;

  var params = {
    ExpressionAttributeValues: {
      ':purl' : {S: predictionUrl}
    },
    KeyConditionExpression: 'pageUrl = :purl',
    TableName: process.env.PREDICTIONS_TABLE_NAME!
  };
  try {
    const result = await dynamo.query(params).promise();

    const prediction = result.Items && result.Items[0];
    if (prediction) {
      return formatResponse(mapDynamoToObject(prediction));
    }
    return formatResponse({}, 404)
  }
  catch(ex: any) {
    console.error(ex)
    return formatResponse({}, 500)
  }
}

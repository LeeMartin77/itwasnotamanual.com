import { APIGatewayProxyEventV2, Callback, Context } from "aws-lambda";
import { formatResponse } from "./shared/formatResponse";

import * as AWS from "aws-sdk";
import { mapDynamoToObject } from "./shared/mapDynamoToObject";

const dynamo = new AWS.DynamoDB();

export async function main (
  _event: APIGatewayProxyEventV2,
  _context: Context,
  _callback: Callback
): Promise<any> { 
  //TODO: Eventually this won't be a thing, but for now it's fine
  var params = {
    TableName: process.env.PREDICTIONS_TABLE_NAME!
  };
  try {
    const result = await dynamo.scan(params).promise();
    if (!result.Items || result.Items.length == 0) {
      return formatResponse({}, 404)
    }
    const predictions = result.Items.map(mapDynamoToObject);
    return formatResponse(predictions[Math.floor(Math.random() * predictions.length)]);
  }
  catch (ex: any) {
    return formatResponse({}, 500)
  }
}
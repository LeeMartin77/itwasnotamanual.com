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
  // TODO: Pagination
  //const lastEvaluated  = event.queryStringParameters && event.queryStringParameters.LastEvaluatedKey
  var params = {
    TableName: process.env.PREDICTIONS_TABLE_NAME!,
    Limit: 20,
    //ExclusiveStartKey: lastEvaluated
  };
  try {
    const result = await dynamo.scan(params).promise();

    const predictions = result.Items;
    if (predictions) {
      return formatResponse({Items: predictions.map(mapDynamoToObject), LastEvaluatedKey: result.LastEvaluatedKey});
    }
  }
  catch (ex: any) {
    return formatResponse({}, 500)
  }
}

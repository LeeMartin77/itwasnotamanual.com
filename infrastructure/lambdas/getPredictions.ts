import { APIGatewayProxyEventV2, Callback, Context } from "aws-lambda";
import { formatResponse } from "./shared/formatResponse";

import * as AWS from "aws-sdk";
import { mapDynamoToObject } from "./shared/mapDynamoToObject";

const dynamo = new AWS.DynamoDB();

export async function main(
  event: APIGatewayProxyEventV2,
  _context: Context,
  _callback: Callback
): Promise<any> {
  let ExclusiveStartKey;
  if (event.queryStringParameters) {
    const { page_url, sort_key } = event.queryStringParameters;
    if (page_url && sort_key) {
      ExclusiveStartKey = {
        page_url: { S: decodeURI(page_url) },
        sort_key: { S: decodeURI(sort_key) },
        global_partition: { S: "0" },
      };
    }
  }
  var params: AWS.DynamoDB.Types.QueryInput = {
    ExpressionAttributeValues: {
      ":moded": { BOOL: true },
      ":globalpart": { S: "0" },
    },
    IndexName: "global_partition-sort_key",
    KeyConditionExpression: "global_partition = :globalpart",
    ScanIndexForward: false,
    TableName: process.env.PREDICTIONS_TABLE_NAME!,
    FilterExpression: "moderated = :moded",
    Limit: 20,
    ExclusiveStartKey,
  };
  try {
    const result = await dynamo.query(params).promise();

    const predictions = result.Items;
    if (predictions) {
      return formatResponse({
        Items: predictions.map(mapDynamoToObject),
        LastEvaluatedKey:
          result.LastEvaluatedKey && mapDynamoToObject(result.LastEvaluatedKey),
      });
    }
  } catch (ex: any) {
    return formatResponse(ex, 500);
  }
}

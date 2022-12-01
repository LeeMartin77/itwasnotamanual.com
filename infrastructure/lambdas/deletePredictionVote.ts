import { APIGatewayProxyEventV2, Callback, Context } from "aws-lambda";
import { formatResponse } from "./shared/formatResponse";

import * as AWS from "aws-sdk";
const dynamo = new AWS.DynamoDB();

export async function main(
  event: APIGatewayProxyEventV2,
  _context: Context,
  _callback: Callback
): Promise<any> {
  if (!event.body) {
    return formatResponse({ message: "No Body" }, 400);
  }
  let parsed;
  try {
    parsed = JSON.parse(event.body);
  } catch (ex: any) {
    return formatResponse({ message: "Could not parse Body" }, 400);
  }
  const { userIdentifier, vote_token } = parsed;
  if (!userIdentifier || !vote_token) {
    return formatResponse(
      { message: `Missing required field "userIdentifier" or "vote_token"` },
      400
    );
  }

  try {
    // Check vote_token is valid
    try {
      var params: AWS.DynamoDB.Types.QueryInput = {
        ExpressionAttributeValues: {
          ":userIdent": { S: userIdentifier },
        },
        KeyConditionExpression: "userId = :userIdent",
        TableName: process.env.PREDICTION_USER_VOTES_TABLE_NAME!,
        Limit: 100,
      };
      const result = await dynamo.query(params).promise();
      if (result.Count && result.Count > 0 && result.Items) {
        const activeVote = result.Items.find((x) => x.status.S == "active");
        if (!activeVote || activeVote.vote_token.S != vote_token) {
          return formatResponse(
            { message: "Could not find valid vote token for user and page" },
            404
          );
        }
        await dynamo
          .deleteItem({
            Key: {
              userId: activeVote.userId,
              status: activeVote.status,
            },
            TableName: process.env.PREDICTION_USER_VOTES_TABLE_NAME!,
          })
          .promise();
        return formatResponse({}, 200);
      }
      return formatResponse({ message: "No votes found for user" }, 404);
    } catch (ex: any) {
      return formatResponse(ex, 500);
    }
  } catch (ex: any) {
    return formatResponse(ex, 500);
  }
}

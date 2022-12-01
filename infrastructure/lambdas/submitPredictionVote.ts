import { APIGatewayProxyEventV2, Callback, Context } from "aws-lambda";
import { formatResponse } from "./shared/formatResponse";

import * as AWS from "aws-sdk";
import { getDynamoPredictionFrompage_url } from "./shared/getDynamoPredictionFrompage_url";
import { generateSortKey, unpackSortKey } from "./shared/generateSortKey";
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
  const { userIdentifier, vote_token, page_url, positive } = parsed;
  if (!userIdentifier || !vote_token || !page_url) {
    return formatResponse(
      {
        message: `Missing required field "userIdentifier", "vote_token" or "page_url"`,
      },
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
        let completedVotes = result.Items.find((x) => x.status.S == "complete");
        if (
          !activeVote ||
          !activeVote.page_urls.SS!.includes(page_url) ||
          activeVote.vote_token.S != vote_token
        ) {
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
        if (!completedVotes) {
          completedVotes = activeVote!;
          completedVotes.status.S = "complete";
          delete completedVotes.vote_token;
        } else {
          completedVotes.page_urls.SS!.push(page_url);
        }
        await dynamo
          .putItem({
            Item: completedVotes,
            TableName: process.env.PREDICTION_USER_VOTES_TABLE_NAME!,
          })
          .promise();
        // Vote has been "redeemed"
        // Update prediction
        const prediction = await getDynamoPredictionFrompage_url(page_url);
        prediction.total_votes.N = (
          parseInt(prediction.total_votes.N!) + 1
        ).toString();
        let { ranking, identifier } = unpackSortKey(prediction.sort_key.S!);
        ranking = positive ? ranking + 1 : ranking - 1;
        prediction.sort_key.S = generateSortKey(ranking, identifier);
        await dynamo
          .putItem({
            Item: prediction,
            TableName: process.env.PREDICTIONS_TABLE_NAME!,
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

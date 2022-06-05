import { APIGatewayProxyEventV2, Callback, Context } from "aws-lambda";
import { formatResponse } from "./shared/formatResponse";

import * as AWS from "aws-sdk";
import { getDynamoPredictionFromPageUrl } from "./shared/getDynamoPredictionFromPageUrl";
import { generateSortKey, unpackSortKey } from "./shared/generateSortKey";
const dynamo = new AWS.DynamoDB();

export async function main (
  event: APIGatewayProxyEventV2,
  _context: Context,
  _callback: Callback
): Promise<any> { 

  if(!event.body) {
    return formatResponse({ message: "No Body"}, 400)
  }
  let parsed;
  try {
    parsed = JSON.parse(event.body)
  } catch (ex: any) {
    return formatResponse({ message: "Could not parse Body"}, 400)
  }
  const { userIdentifier, voteToken, pageUrl, positive } = parsed;
  if (!userIdentifier || !voteToken || !pageUrl) {
    return formatResponse({ message: `Missing required field "userIdentifier", "voteToken" or "pageUrl"`}, 400)
  }

  try {
    // Check voteToken is valid
    try {
      var params: AWS.DynamoDB.Types.QueryInput = {
        ExpressionAttributeValues: {
          ':userIdent' : { S: userIdentifier }
        },
        KeyConditionExpression: "userId = :userIdent",
        TableName: process.env.PREDICTION_USER_VOTES_TABLE_NAME!,
        Limit: 100
      };
      const result = await dynamo.query(params).promise();
      if (result.Count && result.Count > 0 && result.Items) {
        const activeVote = result.Items.find(x => x.status.S == "active")
        let completedVotes = result.Items.find(x => x.status.S == "complete");
        if (!activeVote || !activeVote.pageUrls.SS!.includes(pageUrl) || activeVote.voteToken.S != voteToken) {
          return formatResponse({ message: "Could not find valid vote token for user and page"}, 404)
        }
        await dynamo.deleteItem({
          Key: { 
            userId: activeVote.userId,
            status: activeVote.status
          },
          TableName: process.env.PREDICTION_USER_VOTES_TABLE_NAME!
        }).promise()
        if (!completedVotes) {
          completedVotes = activeVote!
          completedVotes.status.S = "complete"
          delete(completedVotes.voteToken)
        } else {
          completedVotes.pageUrls.SS!.push(pageUrl)
        }
        await dynamo.putItem({
          Item: completedVotes,
          TableName: process.env.PREDICTION_USER_VOTES_TABLE_NAME!
        }).promise()
        // Vote has been "redeemed"
        // Update prediction
        const prediction = await getDynamoPredictionFromPageUrl(pageUrl);
        prediction.total_votes.N = (parseInt(prediction.total_votes.N!) + 1).toString()
        let { ranking, identifier } = unpackSortKey(prediction.sort_key.S!)
        ranking = positive ? ranking + 1 : ranking - 1;
        prediction.sort_key.S = generateSortKey(ranking, identifier);
        await dynamo.putItem({
          Item: prediction,
          TableName: process.env.PREDICTIONS_TABLE_NAME!
        }).promise()
        return formatResponse({}, 200)
      }
      return formatResponse({ message: "No votes found for user" }, 404)
    } catch (ex: any) {
      return formatResponse(ex, 500)
    }
  }
  catch (ex: any) {
    return formatResponse(ex, 500)
  }
}
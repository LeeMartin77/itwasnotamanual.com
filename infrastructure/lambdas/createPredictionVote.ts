import { APIGatewayProxyEventV2, Callback, Context } from "aws-lambda";
import { formatResponse } from "./shared/formatResponse";

import * as AWS from "aws-sdk";
import { mapDynamoToObject } from "./shared/mapDynamoToObject";
import { getDynamoPredictionFromPageUrl } from "./shared/getDynamoPredictionFromPageUrl";

// Just lambda things.....
const crypto = require("crypto");

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
  const { userIdentifier } = parsed;
  if (!userIdentifier) {
    return formatResponse({ message: `Missing required field "userIdentifier"`}, 400)
  }

  // Remember, if it's a new user, they might have nothing
  // Check if user has already open vote - if yes, return that item w/ current key
  let previousVotes: AWS.DynamoDB.AttributeMap | undefined;
  try {
    var params: AWS.DynamoDB.Types.QueryInput = {
      ExpressionAttributeValues: {
        ':userIdent' : { S: userIdentifier },
      },
      KeyConditionExpression: "userId = :userIdent",
      TableName: process.env.PREDICTION_USER_VOTES_TABLE_NAME!,
      Limit: 100
    };
    const result = await dynamo.query(params).promise();
    if (result.Count && result.Count > 0 && result.Items) {
      const activeVotes = result.Items.find(x => x.status.S == "active")
      if (activeVotes) {
        const activePageUrl = activeVotes.pageUrls.SS![0]
        const prediction = await getDynamoPredictionFromPageUrl(activePageUrl)
        const voteToken = activeVotes.voteToken.S!
        return formatResponse({ prediction: mapDynamoToObject(prediction), voteToken, hasVote: true}, 200)
      }
      previousVotes = result.Items.find(x => x.status.S == "complete");
    }
  } catch (ex: any) {
    return formatResponse(ex, 500)
  }

  const newToken = crypto.randomUUID();
  // If no, get item they haven't voted on before w/ new key
  // TODO: We really need to look back at this, as it's hit a lot
  // and if the database is large this will get $$$$$
  const previousVotesPageUrls = previousVotes ? previousVotes.pageUrls.SS! : ["alsdjkasljdnasd"];
  var tableScan: AWS.DynamoDB.Types.ScanInput = {
    ExpressionAttributeValues: {
      ':moded' : { BOOL: true },
      ':prevPages' : { SS: previousVotesPageUrls },
    },
    TableName: process.env.PREDICTIONS_TABLE_NAME!,
    FilterExpression: 'moderated = :moded AND NOT contains(:prevPages, pageUrl)'
  };
  const result = await dynamo.scan(tableScan).promise();

  if (result.Items && result.Items.length > 0) {
    const predictions = result.Items.map(mapDynamoToObject);
    const randomPrediction = predictions[Math.floor(Math.random() * predictions.length)];
    var putParams = {
      Item: {
        userId: { S: userIdentifier },
        status: { S: "active" },
        pageUrls: { SS: [randomPrediction.pageUrl] },
        voteToken: { S: newToken }
      },
      TableName: process.env.PREDICTION_USER_VOTES_TABLE_NAME!
    };
    await dynamo.putItem(putParams).promise();
    return formatResponse({ prediction: randomPrediction, voteToken: newToken, hasVote: true })
  }

  // If no items left, return one from the top one hundred, with no token
  try {
    var params: AWS.DynamoDB.Types.QueryInput = {
      ExpressionAttributeValues: {
        ':moded' : { BOOL: true },
        ':globalpart': { S: "0" }
      },
      IndexName: "global_partition-sort_key",
      KeyConditionExpression: "global_partition = :globalpart",
      ScanIndexForward: false, 
      TableName: process.env.PREDICTIONS_TABLE_NAME!,
      FilterExpression: 'moderated = :moded',
      Limit: 100
    };
    const result = await dynamo.query(params).promise();
    if (!result.Items || result.Items.length == 0) {
      return formatResponse({}, 404)
    }
    const predictions = result.Items.map(mapDynamoToObject);
    return formatResponse({ prediction: predictions[Math.floor(Math.random() * predictions.length)], hasVote: false});
  }
  catch (ex: any) {
    return formatResponse(ex, 500)
  }
}
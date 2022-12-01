import * as AWS from "aws-sdk";

const dynamo = new AWS.DynamoDB();

export async function getDynamoPredictionFrompage_url(
  page_url: string
): Promise<AWS.DynamoDB.AttributeMap> {
  var params: AWS.DynamoDB.QueryInput = {
    ExpressionAttributeValues: {
      ":purl": { S: page_url },
    },
    KeyConditionExpression: "page_url = :purl",
    TableName: process.env.PREDICTIONS_TABLE_NAME!,
  };
  const result = await dynamo.query(params).promise();
  const item = result.Items && result.Items[0];
  if (!item) {
    throw new Error("No Item found");
  }
  return item;
}

import { APIGatewayProxyEventV2, Callback, Context } from "aws-lambda";
import { formatResponse } from "./shared/formatResponse";

import {
  getOpenLibraryWorkById,
  OpenLibraryBooksResponse,
} from "./shared/thirdPartyDataAccess/openlibrary";
import {
  getWikipediaSummary,
  WikipediaSummaryResponse,
} from "./shared/thirdPartyDataAccess/wikipedia";

import * as AWS from "aws-sdk";
import { mapDynamoToObject } from "./shared/mapDynamoToObject";
import { generateSortKey } from "./shared/generateSortKey";

const dynamo = new AWS.DynamoDB();

export async function main(
  event: APIGatewayProxyEventV2,
  context: Context,
  _callback: Callback,
  fnGetOpenLibraryWorkById = getOpenLibraryWorkById,
  fnGetWikipediaSummary = getWikipediaSummary
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
  const { openlibraryid, wiki, quote } = parsed;
  if (!openlibraryid || !wiki) {
    return formatResponse(
      { message: `Missing required field "openlibraryid" or "wiki"` },
      400
    );
  }
  const maxQuoteLength = 150;
  if (quote && quote.length > maxQuoteLength) {
    return formatResponse(
      { message: `Quote must be less than ${maxQuoteLength} characters` },
      400
    );
  }

  var queryParams: AWS.DynamoDB.QueryInput = {
    IndexName: "openlibraryid-wiki",
    ExpressionAttributeValues: {
      ":wikiid": { S: wiki },
      ":openlibid": { S: openlibraryid },
    },
    KeyConditionExpression: "openlibraryid = :openlibid and wiki = :wikiid",
    TableName: process.env.PREDICTIONS_TABLE_NAME!,
  };

  try {
    const result = await dynamo.query(queryParams).promise();
    if (result.Items && result.Items.length > 0) {
      return formatResponse(mapDynamoToObject(result.Items[0]));
    }
  } catch (ex: any) {}

  let bookDetails: OpenLibraryBooksResponse,
    wikiDetails: WikipediaSummaryResponse;

  try {
    bookDetails = await fnGetOpenLibraryWorkById(openlibraryid);
  } catch (ex: any) {
    return formatResponse({ message: "Could not get Book Details" }, 400);
  }
  try {
    wikiDetails = await fnGetWikipediaSummary(wiki);
  } catch (ex: any) {
    return formatResponse({ message: "Could not get Wiki Details" }, 400);
  }

  const [randombit] = context.awsRequestId.split("-");

  let page_url = bookDetails.title + " " + wikiDetails.title;
  page_url = page_url.toLowerCase();
  page_url = page_url.replace(/[^a-z0-9 ]/gi, "");
  page_url = page_url.replace(/[ ]/gi, "-");

  page_url = page_url + "-" + randombit;

  page_url = encodeURIComponent(page_url);

  const dynamoItem: any = {
    id: { S: context.awsRequestId },
    global_partition: { S: "0" },
    sort_key: { S: generateSortKey(0, context.awsRequestId) },
    total_votes: { N: "0" },
    page_url: { S: page_url },
    openlibraryid: { S: openlibraryid },
    book_title: { S: bookDetails.title },
    wiki: { S: wiki },
    wiki_title: { S: wikiDetails.title },
    moderated: { BOOL: false },
  };

  if (quote) {
    dynamoItem.quote = { S: quote };
  }

  var params = {
    TableName: process.env.PREDICTIONS_TABLE_NAME!,
    Item: dynamoItem,
  };
  try {
    await dynamo.putItem(params).promise();

    return formatResponse(mapDynamoToObject(dynamoItem));
  } catch (ex: any) {
    return formatResponse({ ...ex, putItem: dynamoItem }, 500);
  }
}

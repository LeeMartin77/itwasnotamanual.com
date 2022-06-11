
import * as AWS from "aws-sdk";
import { mapDynamoToObject } from "../lambdas/shared/mapDynamoToObject";

import { createInterface } from "readline"

const cli = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const dynamo = new AWS.DynamoDB();

function getDynamoItems(fixedParams: AWS.DynamoDB.Types.ScanInput, items: AWS.DynamoDB.AttributeMap[] = [], lastKey: undefined | AWS.DynamoDB.AttributeMap = undefined): Promise<AWS.DynamoDB.AttributeMap[]> {
  const params = lastKey ? {
    ...fixedParams
  } : {
    ...fixedParams,
    ExclusiveStartKey: lastKey
  }
  return dynamo.scan(params).promise().then(result => {
    if (result.Items) { items.push(...result.Items) }
    if (result.LastEvaluatedKey) { 
      return getDynamoItems(fixedParams, items, result.LastEvaluatedKey)
    }
    return items;
  });
}

function processItem(dynoItem: AWS.DynamoDB.AttributeMap) {
  const objectVersion = mapDynamoToObject(dynoItem)
  cli.question(`https://www.itwasnotamanual.com/prediction/${objectVersion.pageUrl} Action? [None/N (Default), Approve/A, Delete/D]: `, async action => {
    const trimmed = action.trim().toLowerCase()
    if (["d", "delete"].includes(trimmed)) {
      await dynamo.deleteItem({ TableName: process.env.PREDICTIONS_TABLE_NAME!, Key: {
        pageUrl: dynoItem.pageUrl
      }}).promise()
      console.log("Deleted")
    }
    if (["a", "approve"].includes(trimmed)) {
      dynoItem.moderated.BOOL = true
      await dynamo.putItem({ Item: dynoItem, TableName: process.env.PREDICTIONS_TABLE_NAME! }).promise()
      console.log("Approved")
    }
    if (!["d", "delete", "a", "approve"].includes(trimmed)) {
      console.log("Ignoring");
    }
  });      
}

if (process.env.PREDICTIONS_TABLE_NAME) {
  const fixedParams: AWS.DynamoDB.Types.ScanInput = {
    ExpressionAttributeValues: {
      ':moded' : { BOOL: false }
    },
    TableName: process.env.PREDICTIONS_TABLE_NAME,
    FilterExpression: 'moderated = :moded',
  };
  getDynamoItems(fixedParams).then(async dynamoItemsNeedingModerating => {
    console.log("Items to moderate: ", dynamoItemsNeedingModerating.length);
    for (let i = 0; i < dynamoItemsNeedingModerating.length; i++) {
      await processItem(dynamoItemsNeedingModerating[i])
    }
    cli.close()
  })
}


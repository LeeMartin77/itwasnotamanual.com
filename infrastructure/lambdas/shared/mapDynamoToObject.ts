export function mapDynamoToObject(dynamoItem: AWS.DynamoDB.AttributeMap): any {
  let prediction: any = {};
  Object.keys(dynamoItem).forEach(x => { 
    // There is probably a library that does this...
    prediction[x] = dynamoItem[x].S || (dynamoItem[x].N && parseInt(dynamoItem[x].N!)) || dynamoItem[x].BOOL
  })
  return prediction;
}
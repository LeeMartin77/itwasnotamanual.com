export function mapDynamoToObject(dynamoItem: AWS.DynamoDB.AttributeMap): any {
  let prediction: any = {};
  Object.keys(dynamoItem).forEach(x => { 
    prediction[x] = dynamoItem[x].S || dynamoItem[x].BOOL
  })
  return prediction;
}
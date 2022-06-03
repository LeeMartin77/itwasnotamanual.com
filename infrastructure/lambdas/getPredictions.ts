import { APIGatewayProxyEventV2, Callback, Context } from "aws-lambda";

export async function main (
  _event: APIGatewayProxyEventV2,
  _context: Context,
  _callback: Callback
): Promise<any> { 
  return {message: "Hello Friend" }
}
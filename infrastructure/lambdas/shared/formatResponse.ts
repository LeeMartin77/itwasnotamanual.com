export function formatResponse(body: any, statusCode: number = 200) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }
}
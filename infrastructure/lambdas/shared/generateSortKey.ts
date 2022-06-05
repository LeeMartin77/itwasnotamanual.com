const splitchar = "#"

const minusPrefix = "m"
const positivePrefix = "p"

export function generateSortKey(votes: number, uniqueId: string) {
  const prefix = votes < 0 ? "m" : "p"
  votes = Math.abs(votes);
  return `${prefix}${splitchar}${String(votes).padStart(8, '0')}${splitchar}${uniqueId}`
}

export function unpackSortKey(sortKey: string): { ranking: number, identifier: string } {
  const [prefix, number, identifier] = sortKey.split(splitchar)
  const numberValue = prefix == positivePrefix ? parseInt(number) : 0 - parseInt(number)
  return { ranking: numberValue, identifier }
}
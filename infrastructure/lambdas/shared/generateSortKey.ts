const splitchar = "~"


const offset = 5000000

export function generateSortKey(votes: number, uniqueId: string) {
  votes = offset + votes;
  return `${splitchar}${String(votes).padStart(8, '0')}${splitchar}${uniqueId}`
}

export function unpackSortKey(sortKey: string): { ranking: number, identifier: string } {
  const [number, identifier] = sortKey.split(splitchar)
  let numberValue = parseInt(number) - offset;
  return { ranking: numberValue, identifier }
}
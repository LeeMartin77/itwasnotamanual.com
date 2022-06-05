export function generateSortKey(votes: number, uniqueId: string) {
  // Things might have more negative votes, but it should just go to 0
  if(votes < 0) {
    votes = 0;
  }
  return `${String(votes).padStart(8, '0')}-${uniqueId}`
}
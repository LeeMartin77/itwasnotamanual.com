
// need to add .json to the end
// It's then a redirect
// Also needs to then fetch further resources
// https://openlibrary.org/dev/docs/api/books
const openlibrarybase = "https://openlibrary.org"

// End with -S.jpg, -M.jpg or -L.jpg
// https://openlibrary.org/dev/docs/api/covers
const coverUrl = "https://covers.openlibrary.org/b/id/"
type CoverSizes = 'S' | 'M' | 'L'

export interface OpenLibraryBooksResponse {
  location?: string
  isbn_10: string[]
  isbn_13: string[]
  title: string
  publish_date?: string
  // This key can be added to the base openlibrary with a .json to get details
  authors: {author: {key: string }, type: { key: string }}[]
  works: { key: string }[]
  covers: number[],
  type: {
    key: string
  }
}

export interface OpenLibraryAuthorResponse {
  personal_name: string
  bio: string
  birth_date: string
  death_date: string | undefined
  remote_ids: {
    // Maybe we can use this in the future?
    wikidata: string
  }
}


export async function getOpenLibraryWorkById(openLibraryId: string): Promise<OpenLibraryBooksResponse> {
  const response = await fetch(openlibrarybase + "/works/" + openLibraryId + ".json");
  if (!response.ok) {
    throw Error("Something went wrong")
  }
  const body = await response.json() as OpenLibraryBooksResponse
  if (body.type.key === "/type/redirect") {
    const parts = body.location!.split("/")
    return getOpenLibraryWorkById(parts[parts.length - 1])
  }
  return body;
}

export async function getOpenLibraryAuthorByKey(openLibraryAuthorKey: string): Promise<OpenLibraryAuthorResponse> {
  const response = await fetch(openlibrarybase + openLibraryAuthorKey + ".json");
  if (!response.ok) {
    throw Error("Something went wrong")
  }
  return await response.json();
}

export function formatOpenLibraryCoverUrlFromCoverNumber(coverNumber: number, coverSize: CoverSizes = 'M'): string {
  return coverUrl + coverNumber + '-' + coverSize + '.jpg'
}
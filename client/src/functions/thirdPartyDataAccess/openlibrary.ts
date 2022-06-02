
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
  isbn_10: string[]
  isbn_13: string[]
  title: string
  publish_date?: string
  // This key can be added to the base openlibrary with a .json to get details
  authors: {author: {key: string }, type: { key: string }}[]
  works: { key: string }[]
  covers: number[]
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
  return await (await fetch(openlibrarybase + "/works/" + openLibraryId + ".json")).json()
}

export async function getOpenLibraryAuthorByKey(openLibraryAuthorKey: string): Promise<OpenLibraryAuthorResponse> {
  return await (await fetch(openlibrarybase + openLibraryAuthorKey + ".json")).json()
}

export function formatOpenLibraryCoverUrlFromCoverNumber(coverNumber: number, coverSize: CoverSizes = 'M'): string {
  return coverUrl + coverNumber + '-' + coverSize + '.jpg'
}
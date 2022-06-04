import fetch from "node-fetch"

// need to add .json to the end
// It's then a redirect
// Also needs to then fetch further resources
// https://openlibrary.org/dev/docs/api/books
const openlibrarybase = "https://openlibrary.org"


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


export async function getOpenLibraryWorkById(openLibraryId: string): Promise<OpenLibraryBooksResponse> {
  const result = await fetch(openlibrarybase + "/works/" + openLibraryId + ".json")
  if (!result.ok) {
    throw new Error("Could not get OpenLibrary book")
  }
  const body = await result.json() as OpenLibraryBooksResponse
  if (body.type.key === "/type/redirect") {
    const parts = body.location!.split("/")
    return getOpenLibraryWorkById(parts[parts.length - 1])
  }
  return body;
}

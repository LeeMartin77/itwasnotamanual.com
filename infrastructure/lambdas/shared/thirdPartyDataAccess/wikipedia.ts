import fetch from "node-fetch"

// https://en.wikipedia.org/api/rest_v1/#/Page%20content/get_page_summary__title_
const wikipediaSummaryUrl = "https://en.wikipedia.org/api/rest_v1/page/summary/"

export interface WikipediaContentUrls {
  page: string
  revisions: string
  edit: string
  talk: string
}

export interface WikipediaSummaryResponse {
  title: string
  displaytitle: string
  pageid: number
  description: string
  content_urls: {
    desktop: WikipediaContentUrls
    mobile: WikipediaContentUrls
  }
  extract: string
}

const requiredHeaders = {
  "Api-User-Agent": "admin@itwasnotamanual.com"
}

export async function getWikipediaSummary(wikiPageSlug: string): Promise<WikipediaSummaryResponse> {
  const result = await fetch(wikipediaSummaryUrl + wikiPageSlug, { headers: requiredHeaders });
  if (!result.ok) {
    throw new Error("Could not get wikipedia summary")
  }
  return await result.json() as WikipediaSummaryResponse
}
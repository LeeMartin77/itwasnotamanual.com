// https://en.wikipedia.org/api/rest_v1/#/Page%20content/get_page_summary__title_
const wikipediaSummaryUrl = "https://en.wikipedia.org/api/rest_v1/page/summary/"
// https://en.wikipedia.org/api/rest_v1/#/Page%20content/getContent-media-list
const wikipediaMediaUrl = "https://en.wikipedia.org/api/rest_v1/page/media-list/"

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

export type WikipediaImageType = "image" | string
export type WikipediaImageScales = "1x" | "1.5x" | "2x"

export interface WikipediaMediaResponse {
  items: {
    title: string,
    type: WikipediaImageType
    leadImage: boolean
    showInGallery: boolean
    srcset: {
      src: string,
      scale: WikipediaImageScales
    }[]
  }[]
}

const wikipediaRoot = "https://en.wikipedia.org/wiki"

export function wikipediaLinkFromSlug(wikiSlug: string): string {
  return wikipediaRoot + "/" + wikiSlug;
}

export async function checkWikipediaArticle(potentialWikipediaValue: string): Promise<[string, WikipediaSummaryResponse]> {
  if (potentialWikipediaValue.startsWith(wikipediaRoot)) {
    potentialWikipediaValue = potentialWikipediaValue.replace(wikipediaRoot, '')
  }

  if (potentialWikipediaValue.startsWith("http")) {
    throw new Error("Not a wikipedia link")
  }


  if (potentialWikipediaValue.startsWith("/")) {
    potentialWikipediaValue = potentialWikipediaValue.replace("/", "")
    if (potentialWikipediaValue.includes("#")) {
      [potentialWikipediaValue] = potentialWikipediaValue.split("#")
    }
    if (potentialWikipediaValue.includes("?")) {
      [potentialWikipediaValue] = potentialWikipediaValue.split("?")
    }
  }

  const wikiResult = await getWikipediaSummary(potentialWikipediaValue)

  return [potentialWikipediaValue, wikiResult];
}

const requiredHeaders = {
  "Api-User-Agent": "admin@itwasnotamanual.com"
}

export async function getWikipediaSummary(wikiPageSlug: string): Promise<WikipediaSummaryResponse> {
  const response = await fetch(wikipediaSummaryUrl + wikiPageSlug, { headers: requiredHeaders });
  if (!response.ok) {
    throw Error("Something went wrong")
  }
  return await response.json();
}

export async function getWikipediaMedia(wikiPageSlug: string): Promise<WikipediaMediaResponse> {
  const response = await fetch(wikipediaMediaUrl + wikiPageSlug, { headers: requiredHeaders });
  if (!response.ok) {
    throw Error("Something went wrong")
  }
  return await response.json();
}
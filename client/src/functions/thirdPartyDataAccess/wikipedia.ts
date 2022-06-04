
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

export async function getWikipediaSummary(wikiPageSlug: string): Promise<WikipediaSummaryResponse> {
  const response = await fetch(wikipediaSummaryUrl + wikiPageSlug);
  if (!response.ok) {
    throw Error("Something went wrong")
  }
  return await response.json();
}

export async function getWikipediaMedia(wikiPageSlug: string): Promise<WikipediaMediaResponse> {
  const response = await fetch(wikipediaMediaUrl + wikiPageSlug);
  if (!response.ok) {
    throw Error("Something went wrong")
  }
  return await response.json();
}
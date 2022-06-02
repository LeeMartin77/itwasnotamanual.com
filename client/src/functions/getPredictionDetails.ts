import { Prediction, PredictionDetail } from "../types/prediction"


// https://en.wikipedia.org/api/rest_v1/#/Page%20content/get_page_summary__title_
const wikipediaSummaryUrl = "https://en.wikipedia.org/api/rest_v1/page/summary/"
// https://en.wikipedia.org/api/rest_v1/#/Page%20content/getContent-media-list
const wikipediaMediaUrl = "https://en.wikipedia.org/api/rest_v1/page/media-list/"

interface WikipediaContentUrls {
  page: string
  revisions: string
  edit: string
  talk: string
}

interface WikipediaSummaryResponse {
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

type WikipediaImageType = "image" | string
type WikipediaImageScales = "1x" | "1.5x" | "2x"

interface WikipediaMediaResponse {
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

// need to add .json to the end
// It's then a redirect
// Also needs to then fetch further resources
// https://openlibrary.org/dev/docs/api/books
const openlibraryWorksApi = "https://openlibrary.org/works/"
const openlibrarybase = "https://openlibrary.org"

// End with -S.jpg, -M.jpg or -L.jpg
// https://openlibrary.org/dev/docs/api/covers
const coverUrl = "https://covers.openlibrary.org/b/id/"

interface OpenLibraryBooksResponse {
  isbn_10: string[]
  isbn_13: string[]
  title: string
  publish_date?: string
  // This key can be added to the base openlibrary with a .json to get details
  authors: {author: {key: string }, type: { key: string}}[]
  works: { key: string }[]
  covers: number[]
}

interface OpenLibraryAuthorResponse {
  personal_name: string
  bio: string
  birth_date: string
  death_date: string | undefined
  remote_ids: {
    // Maybe we can use this in the future?
    wikidata: string
  }
}

export async function getPredictionDetails(prediction: Prediction): Promise<PredictionDetail> {
  let loadedDetails: PredictionDetail = {
    ...prediction,
    book: {
      cover_url: '',
      title: '',
      authors: [],
    },
    subject: {
      title: '',
      image_url: ''
    }
  }
  // TODO: I mean there is a lot to do but rather than a massive chain we could
  // do some stuff concurrently
  const data: OpenLibraryBooksResponse = await (await fetch(openlibraryWorksApi + prediction.openlibraryid + ".json")).json()
  if (data.covers.length > 0) {
    loadedDetails.book.cover_url = coverUrl + data.covers[0] + "-M.jpg";
  }
  loadedDetails.book.title = data.title

  // TODO: We'll need to change this to load many, but one will do for now
  const author_data: OpenLibraryAuthorResponse = await(await fetch(openlibrarybase + data.authors[0].author.key + '.json')).json()
  
  loadedDetails.book.authors.push({ personal_name: author_data.personal_name})

  const wikidata: WikipediaSummaryResponse = await(await fetch(wikipediaSummaryUrl + prediction.wiki)).json()
  loadedDetails.subject.title = wikidata.title

  const wikimedia: WikipediaMediaResponse = await(await fetch(wikipediaMediaUrl + prediction.wiki)).json()

  if (wikimedia.items.length > 0) {
    const featured = wikimedia.items.find(x => x.leadImage)
    // TODO: Should probably check scalings too...
    if (featured) {
      loadedDetails.subject.image_url = "https:" + featured.srcset[0].src
    } else {
      loadedDetails.subject.image_url = "https:" + wikimedia.items[0].srcset[0].src
    }
  }

  return loadedDetails;
}
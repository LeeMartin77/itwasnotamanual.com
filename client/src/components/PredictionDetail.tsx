import React, { useEffect, useState } from 'react';

interface Prediction {
  openlibrary: string
  wiki: string
  quote: string
}

const fakePrediction: Prediction = {
  openlibrary: "OL1168083W",
  wiki: "Smart_speaker",
  quote: "He thought of the telescreen with its never-sleeping ear. They could spy upon you night and day, but if you kept your head, you could still outwit them."
}

interface PredictionDetail extends Prediction {
  book: {
    cover_url: string
    title: string
    authors: { personal_name: string }[]
    publish_date: string
  }
  thing: {
    title: string
    image_url: string
  }
}

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
  publish_date: string
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


export function PredictionDetails() {
  const [predictionDetail, setPredictionDetail] = useState<PredictionDetail | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    let loadedDetails: PredictionDetail = {
      ...fakePrediction,
      book: {
        cover_url: '',
        title: '',
        authors: [],
        publish_date: ''
      },
      thing: {
        title: '',
        image_url: ''
      }
    }
    // TODO: I mean there is a lot to do but rather than a massive chain we could
    // do some stuff concurrently
    fetch(openlibraryWorksApi + fakePrediction.openlibrary + ".json").then(response => {
      response.json().then((data: OpenLibraryBooksResponse) => {
        if (data.covers.length > 0) {
          loadedDetails.book.cover_url = coverUrl + data.covers[0] + "-M.jpg";
        }
        loadedDetails.book.title = data.title
        loadedDetails.book.publish_date = data.publish_date
        // TODO: We'll need to change this to load many, but one will do for now
        fetch(openlibrarybase + data.authors[0].author.key + '.json').then(response => {
          response.json().then((author_data: OpenLibraryAuthorResponse) => {
            loadedDetails.book.authors.push({ personal_name: author_data.personal_name})
            fetch(wikipediaSummaryUrl + fakePrediction.wiki).then(response => {
              response.json().then((wikidata: WikipediaSummaryResponse) => {
                loadedDetails.thing.title = wikidata.title
                fetch(wikipediaMediaUrl + fakePrediction.wiki).then(response => {
                  response.json().then((data: WikipediaMediaResponse) => {
                    if (data.items.length > 0) {
                      const featured = data.items.find(x => x.leadImage)
                      // TODO: Should probably check scalings too...
                      if (featured) {
                        loadedDetails.thing.image_url = "https:" + featured.srcset[0].src
                      } else {
                        loadedDetails.thing.image_url = "https:" + data.items[0].srcset[0].src
                      }
                    }
                    setPredictionDetail(loadedDetails)
                    setLoading(false)
                  })
                })
              })
            })
          })
        })
      })
    })
  }, [setPredictionDetail, setLoading]);
  return (
    <div>
      {loading ? <span>Loading...</span> : 
       !predictionDetail ? <span>Error</span> : 
        <div>
          <h1>{predictionDetail.book.authors[0].personal_name}</h1>
          <p>predicted the</p>
          <h1>{predictionDetail.thing.title}</h1>
          <p>in</p>
          <h1>{predictionDetail.book.title}</h1>
          <h4>{predictionDetail.book.publish_date}</h4>
          <p>{predictionDetail.quote}</p>
          <img src={predictionDetail.book.cover_url} alt={predictionDetail.book.title+ " Cover"} />
          <img src={predictionDetail.thing.image_url} alt={predictionDetail.thing.title+ " Image"} />
        </div>}
    </div>
  );
}

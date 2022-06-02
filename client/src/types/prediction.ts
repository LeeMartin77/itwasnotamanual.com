export interface Prediction {
  id: string
  url: string
  openlibraryid: string
  // TODO: We should populate this from openlibrary in the lambda
  book_title: string
  wiki: string
  // TODO: We should populate this from wikipedia in the lambda
  wiki_title: string
  quote: string
}


export interface PredictionDetail extends Prediction {
  book: {
    cover_url?: string
    title: string
    authors: { personal_name: string }[]
  }
  subject: {
    title: string
    image_url?: string
  }
}

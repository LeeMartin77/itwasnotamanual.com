export interface Prediction {
  id: string
  sort_key: string
  total_votes: number
  pageUrl: string
  openlibraryid: string
  // TODO: We should populate this from openlibrary in the lambda
  book_title: string
  wiki: string
  // TODO: We should populate this from wikipedia in the lambda
  wiki_title: string
  quote?: string
  moderated: boolean
}


export interface PredictionDetail extends Prediction {
  book: {
    cover_url_sm?: string
    cover_url_md?: string
    cover_url_lg?: string
    title: string
    authors: { personal_name: string }[]
    description: string
  }
  subject: {
    title: string
    image_url?: string
    extract: string
  }
}

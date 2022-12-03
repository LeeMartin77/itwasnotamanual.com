export interface StoredPrediction {
  page_url: string;
  openlibraryid: string;
  book_title: string;
  wiki: string;
  wiki_title: string;
  quote?: string;
  moderated: boolean;
}
export interface StoredPredictionScore {
  page_url: string;
  score: number;
  total_votes: number;
}

export interface Prediction {
  page_url: string;
  score: number;
  total_votes: number;
  openlibraryid: string;
  book_title: string;
  wiki: string;
  wiki_title: string;
  quote?: string;
  moderated: boolean;
}

export interface PredictionVote {
  userid: string;
  prediction: Prediction;
  vote_token?: string;
  has_vote: boolean;
}

export interface PredictionVoteStorage {
  user_id: string;
  page_url: string;
  vote_token: string;
  positive?: boolean;
}

export interface PredictionDetail extends Prediction {
  book: {
    cover_url_sm?: string;
    cover_url_md?: string;
    cover_url_lg?: string;
    title: string;
    authors: { personal_name: string }[];
    description: string;
  };
  subject: {
    title: string;
    image_url?: string;
    extract: string;
  };
}

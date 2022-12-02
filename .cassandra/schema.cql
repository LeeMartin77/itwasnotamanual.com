CREATE KEYSPACE IF NOT EXISTS itwasnotamanual 
  WITH REPLICATION = {'class':'SimpleStrategy','replication_factor':1};

CREATE TABLE IF NOT EXISTS itwasnotamanual.prediction(
  page_url text PRIMARY KEY,
  score int,
  total_votes int,
  openlibraryid text,
  book_title text,
  wiki text,
  wiki_title text,
  quote text,
  moderated boolean
);

CREATE INDEX IF NOT EXISTS ON itwasnotamanual.prediction (score);
CREATE INDEX IF NOT EXISTS ON itwasnotamanual.prediction (openlibraryid);
CREATE INDEX IF NOT EXISTS ON itwasnotamanual.prediction (wiki);
CREATE INDEX IF NOT EXISTS ON itwasnotamanual.prediction (moderated);

CREATE TABLE IF NOT EXISTS itwasnotamanual.prediction_vote(
  user_id text,
  vote_token text,
  page_url text,
  positive boolean,
  PRIMARY KEY ((user_id), vote_token)
);

CREATE INDEX IF NOT EXISTS ON itwasnotamanual.prediction_vote (page_url);
CREATE INDEX IF NOT EXISTS ON itwasnotamanual.prediction_vote (positive);

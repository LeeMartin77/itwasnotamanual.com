import { randomUUID } from "node:crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { CASSANDRA_CLIENT, rowToObject } from "../../../system/storage";
import {
  PredictionVote,
  PredictionVoteStorage,
} from "../../../types/prediction";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message: string } | PredictionVote>
) {
  if (req.method !== "POST") {
    return res.status(400).send({ message: "POST Request only" });
  }
  // POST
  const { userIdentifier } = req.body;
  if (!userIdentifier) {
    return res
      .status(400)
      .send({ message: `Missing required field "userIdentifier"` });
  }
  // Logic flow:
  // check if user has active vote - if yes, return that
  const existing = await CASSANDRA_CLIENT.execute(
    `select * 
    from itwasnotamanual.prediction_vote
    where user_id = ?;`,
    [userIdentifier],
    { prepare: true }
  );

  const existingVotes = existing.rows
    .filter((x) => x !== null)
    .map(rowToObject) as PredictionVoteStorage[];

  const index = existingVotes.findIndex(
    (x) => x.positive === null || x.positive === undefined
  );

  if (index > -1) {
    const voteStorage = existingVotes[index];
    const prediction = await CASSANDRA_CLIENT.execute(
      `select * 
      from itwasnotamanual.prediction
      where page_url = ?;`,
      [voteStorage.page_url],
      { prepare: true }
    );
    const vote: PredictionVote = {
      userid: voteStorage.user_id,
      prediction: rowToObject(prediction.first()),
      vote_token: voteStorage.vote_token,
      has_vote: true,
    };
    return res.status(200).json(vote);
  }
  const predictionPageUrls = (
    await CASSANDRA_CLIENT.execute(
      `select page_url
    from itwasnotamanual.prediction
    WHERE moderated = true ALLOW FILTERING;`,
      [],
      { prepare: true }
    )
  ).rows.map((x) => x.get("page_url")) as string[];

  const availableVotes = predictionPageUrls.filter(
    (x) => existingVotes.findIndex((y) => y.page_url === x) === -1
  );
  if (availableVotes.length > 0) {
    // if moderated, unvoted item, create vote and return that
    const predictionUrl =
      availableVotes[Math.floor(Math.random() * availableVotes.length)];
    const prediction = await CASSANDRA_CLIENT.execute(
      `select * 
      from itwasnotamanual.prediction
      where page_url = ?;`,
      [predictionUrl],
      { prepare: true }
    );
    const newVote: PredictionVoteStorage = {
      user_id: userIdentifier,
      page_url: predictionUrl,
      vote_token: randomUUID(),
    };
    await CASSANDRA_CLIENT.execute(
      `insert into itwasnotamanual.prediction_vote (user_id, page_url, vote_token)
      values (?, ?, ?);`,
      [newVote.user_id, newVote.page_url, newVote.vote_token],
      { prepare: true }
    );
    return res.status(200).json({
      userid: userIdentifier,
      prediction: rowToObject(prediction.first()),
      has_vote: true,
      vote_token: newVote.vote_token,
    });
  }
  // random moderated item
  const predictionUrl =
    predictionPageUrls[Math.floor(Math.random() * predictionPageUrls.length)];
  const prediction = await CASSANDRA_CLIENT.execute(
    `select * 
    from itwasnotamanual.prediction
    where page_url = ?;`,
    [predictionUrl],
    { prepare: true }
  );

  res.status(200).json({
    userid: userIdentifier,
    prediction: rowToObject(prediction.first()),
    has_vote: false,
  });
}

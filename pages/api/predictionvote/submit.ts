import type { NextApiRequest, NextApiResponse } from "next";
import { CASSANDRA_CLIENT, rowToObject } from "../../../system/storage";
import { PredictionVoteStorage } from "../../../types/prediction";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message: string }>
) {
  if (req.method !== "POST") {
    return res.status(400).send({ message: `Must be post request` });
  }
  // POST
  const { userIdentifier, vote_token, positive } = req.body;
  if (!userIdentifier || !vote_token || !positive) {
    return res.status(400).send({
      message: `Missing required field "userIdentifier", "vote_token"`,
    });
  }
  // get vote by userid and token
  const vote = await CASSANDRA_CLIENT.execute(
    `select * from itwasnotamanual.prediction_vote
    WHERE user_id = ? and vote_token = ?;`,
    [userIdentifier, vote_token],
    { prepare: true }
  );

  if (vote.rowLength === 0) {
    return res.status(400).send({ message: `No vote found` });
  }

  const voteStorage = rowToObject(vote.first()) as PredictionVoteStorage;

  if (voteStorage.positive !== undefined && voteStorage.positive !== null) {
    return res.status(400).json({ message: "Vote already used" });
  }

  await CASSANDRA_CLIENT.execute(
    `UPDATE itwasnotamanual.prediction_vote SET positive = ?
    WHERE user_id = ? and vote_token = ?;`,
    [positive, userIdentifier, vote_token],
    { prepare: true }
  );

  await CASSANDRA_CLIENT.execute(
    `UPDATE itwasnotamanual.prediction_score SET score = score + ?, total_votes = total_votes + 1
    WHERE page_url = ?;`,
    [positive ? 1 : -1, voteStorage.page_url],
    { prepare: true }
  );
  // Increment/decrement prediction
  // Mark vote as "used"
  res.status(200).json({ message: "ok" });
}

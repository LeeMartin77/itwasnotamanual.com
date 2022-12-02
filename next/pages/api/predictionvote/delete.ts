import type { NextApiRequest, NextApiResponse } from "next";
import { CASSANDRA_CLIENT } from "../../../system/storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message: string }>
) {
  if (req.method !== "POST") {
    return res.status(400).send({ message: "POST Request only" });
  }
  // POST
  const { userIdentifier, vote_token } = req.body;
  if (!userIdentifier || !vote_token) {
    return res.status(400).send({
      message: `Missing required field "userIdentifier" or "vote_token"`,
    });
  }
  await CASSANDRA_CLIENT.execute(
    `delete from itwasnotamanual.prediction_vote
    WHERE user_id = ? and vote_token = ?;`,
    [userIdentifier, vote_token],
    { prepare: true }
  );
  res.status(200).json({ message: "Deleted" });
}

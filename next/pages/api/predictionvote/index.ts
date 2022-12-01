import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message: string }>
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
  // if not, check if user has voted on every moderated prediction - if yes, return a random one
  // if moderated, unvoted item, create vote and return that
  // response: { prediction: randomPrediction, vote_token: newToken, has_vote: true }
  res.status(500).json({ message: "Not Implemented" });
}

import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
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
  // TODO Fling the delete at the DB, and hope
  res.status(200).json({ message: "Deleted" });
}

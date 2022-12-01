import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message: string }>
) {
  if (req.method !== "POST") {
    return res.status(400).send({ message: `Must be post request` });
  }
  // POST
  const { userIdentifier, vote_token, positive } = req.body;
  if (!userIdentifier || !vote_token) {
    return res.status(400).send({
      message: `Missing required field "userIdentifier", "vote_token"`,
    });
  }
  // get vote by userid and token
  const vote: {
    userId: string;
    vote_token: string;
    page_url: string;
    used: boolean;
  } = undefined as any;
  if (!vote || vote.used) {
    return res.status(400).send({ message: `No vote found` });
  }
  const { userId, vote_token: token, page_url } = vote;
  // Increment/decrement prediction
  // Mark vote as "used"
  res.status(200).json({ message: "ok" });
}

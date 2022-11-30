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
  const { userIdentifier, voteToken, positive } = req.body;
  if (!userIdentifier || !voteToken) {
    return res.status(400).send({
      message: `Missing required field "userIdentifier", "voteToken"`,
    });
  }
  // get vote by userid and token
  const vote: {
    userId: string;
    token: string;
    pageUrl: string;
    used: boolean;
  } = undefined as any;
  if (!vote || vote.used) {
    return res.status(400).send({ message: `No vote found` });
  }
  const { userId, token, pageUrl } = vote;
  // Increment/decrement prediction
  // Mark vote as "used"
  res.status(200).json({ message: "ok" });
}

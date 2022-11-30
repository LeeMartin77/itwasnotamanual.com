import type { NextApiRequest, NextApiResponse } from "next";
import { Prediction } from "../../../types/prediction";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message: string } | Prediction>
) {
  if (req.method !== "GET") {
    return res.status(400).send({ message: "GET Request only" });
  }
  // GET
  const { predictionUrl } = req.query;
  res.status(500).json({ message: "Not Implemented" });
}

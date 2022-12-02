import type { NextApiRequest, NextApiResponse } from "next";
import { CASSANDRA_CLIENT, rowToObject } from "../../../system/storage";
import { Prediction } from "../../../types/prediction";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message: string } | Prediction>
) {
  if (req.method !== "GET") {
    return res.status(400).send({ message: "GET Request only" });
  }
  // GET
  const { predictionUrl } = req.query;
  const existing = await CASSANDRA_CLIENT.execute(
    `select * 
    from itwasnotamanual.prediction 
    where page_url = ?;`,
    [predictionUrl],
    { prepare: true }
  );

  if (existing && existing.rowLength > 0) {
    res.status(200).send(rowToObject(existing.first()));
  }
  res.status(404).json({ message: "Not Found" });
}

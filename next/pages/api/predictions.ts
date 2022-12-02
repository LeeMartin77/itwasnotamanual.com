import type { NextApiRequest, NextApiResponse } from "next";
import { CASSANDRA_CLIENT, rowToObject } from "../../system/storage";
import { Prediction } from "../../types/prediction";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message: string } | Prediction[]>
) {
  if (req.method !== "GET") {
    return res.status(400).send({ message: "GET Request only" });
  }
  // GET
  // TODO: implement from, look into partition key
  const { lastPageUrl, pageLength } = req.query;
  const existing = await CASSANDRA_CLIENT.execute(
    `select * 
    from itwasnotamanual.prediction
    LIMIT ?;`,
    [pageLength],
    { prepare: true }
  );
  const existingScores = await CASSANDRA_CLIENT.execute(
    `select * 
    from itwasnotamanual.prediction_score
    LIMIT ?;`,
    [pageLength],
    { prepare: true }
  );
  res.status(200).send(
    existing.rows.map((r) => {
      const scoring = existingScores.rows.find(
        (rs) => rs.get("page_url") === r.get("page_url")
      );
      return {
        ...rowToObject(r),
        score: scoring?.get("score") ?? 0,
        total_votes: scoring?.get("total_votes") ?? 0,
      };
    }) as Prediction[]
  );
}

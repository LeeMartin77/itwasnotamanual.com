import type { NextApiRequest, NextApiResponse } from "next";
import {
  getOpenLibraryWorkById,
  OpenLibraryBooksResponse,
} from "../../../functions/serversideThirdPartyDataAccess/openlibrary";
import {
  getWikipediaSummary,
  WikipediaSummaryResponse,
} from "../../../functions/serversideThirdPartyDataAccess/wikipedia";
import { CASSANDRA_CLIENT, rowToObject } from "../../../system/storage";
import { Prediction } from "../../../types/prediction";
import { randomUUID } from "node:crypto";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message: string } | Prediction>,
  fnGetOpenLibraryWorkById = getOpenLibraryWorkById,
  fnGetWikipediaSummary = getWikipediaSummary
) {
  if (req.method !== "POST") {
    return res.status(400).send({ message: "POST Request only" });
  }
  // POST
  let parsed;
  try {
    parsed = req.body;
  } catch (ex: any) {
    return res.status(400).send({ message: "Could not parse Body" });
  }
  const {
    openlibraryid,
    wiki,
    quote,
  }: { openlibraryid: string; wiki: string; quote?: string } = parsed;
  if (!openlibraryid || !wiki) {
    return res
      .status(400)
      .send({ message: `Missing required field "openlibraryid" or "wiki"` });
  }
  const maxQuoteLength = 150;
  if (quote && quote.length > maxQuoteLength) {
    return res.status(400).send({
      message: `Quote must be less than ${maxQuoteLength} characters`,
    });
  }

  const existing = await CASSANDRA_CLIENT.execute(
    `select * 
    from itwasnotamanual.prediction 
    where openlibraryid = ? 
      and wiki = ? allow filtering;`,
    [openlibraryid, wiki],
    { prepare: true }
  );

  if (existing && existing.rowLength > 0) {
    return res.status(200).send(rowToObject(existing.first()));
  }

  let bookDetails: OpenLibraryBooksResponse,
    wikiDetails: WikipediaSummaryResponse;

  try {
    bookDetails = await fnGetOpenLibraryWorkById(openlibraryid);
  } catch (ex: any) {
    return res.status(400).send({ message: "Could not get Book Details" });
  }
  try {
    wikiDetails = await fnGetWikipediaSummary(wiki);
  } catch (ex: any) {
    return res.status(400).send({ message: "Could not get Wiki Details" });
  }

  const [randombit] = randomUUID().split("-");

  let page_url = bookDetails.title + " " + wikiDetails.title;
  page_url = page_url.toLowerCase();
  page_url = page_url.replace(/[^a-z0-9 ]/gi, "");
  page_url = page_url.replace(/[ ]/gi, "-");

  page_url = page_url + "-" + randombit;

  page_url = encodeURIComponent(page_url);

  const prediction: Prediction = {
    page_url,
    score: 0,
    total_votes: 0,
    openlibraryid,
    book_title: bookDetails.title,
    wiki: wiki,
    wiki_title: wikiDetails.title,
    moderated: false,
    quote,
  };

  await CASSANDRA_CLIENT.execute(
    `insert into 
    itwasnotamanual.prediction (${Object.keys(prediction).join(",")})
    values (${Object.keys(prediction)
      .map(() => "?")
      .join(",")});`,
    Object.values(prediction),
    { prepare: true }
  );

  res.status(200).json(prediction);
}

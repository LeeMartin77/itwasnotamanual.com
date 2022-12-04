import Head from "next/head";
import { InferGetServerSidePropsType } from "next/types";
import { PredictionDetailsComponent } from "../../components/prediction/PredictionDetailsComponent";
import { CASSANDRA_CLIENT, rowToObject } from "../../system/storage";
import {
  StoredPrediction,
  StoredPredictionScore,
} from "../../types/prediction";

export const getServerSideProps = async ({
  params: { predictionUrl },
}: {
  params: { predictionUrl: string };
}) => {
  if (!predictionUrl) {
    return {
      notFound: true,
    };
  }
  const existing = await CASSANDRA_CLIENT.execute(
    `select * 
    from itwasnotamanual.prediction 
    where page_url = ?;`,
    [predictionUrl],
    { prepare: true }
  );

  if (existing && existing.rowLength > 0) {
    const prediction = rowToObject(existing.first()) as StoredPrediction;
    const predictionScore = rowToObject(
      (
        await CASSANDRA_CLIENT.execute(
          `select page_url, cast(score as int) as score, cast(total_votes as int) as total_votes
      from itwasnotamanual.prediction_score
      where page_url = ?;`,
          [predictionUrl],
          { prepare: true }
        )
      ).first()
    ) as StoredPredictionScore;

    return {
      props: {
        prediction: {
          ...prediction,
          score: predictionScore.score,
          total_votes: predictionScore.total_votes,
        },
      },
    };
  }

  return {
    notFound: true,
  };
};

export default function Predictions({
  prediction,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>
          {prediction.wiki_title} in {prediction.book_title} :: It Was Not a
          Manual
        </title>
        <meta
          name="description"
          content={`${prediction.wiki_title} in ${
            prediction.book_title
          } - it was not a manual.${
            prediction.quote ? ` "` + prediction.quote + `"` : ""
          }`}
        />
        <meta property="og:image" content="/logo512.png" />
      </Head>
      <PredictionDetailsComponent
        prediction={prediction}
        predictionLoading={false}
        predictionError={false}
      />
    </>
  );
}

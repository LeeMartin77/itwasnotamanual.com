import Head from "next/head";
import { PredictionRankingComponent } from "../components/prediction/PredictionRankingComponent";

export default function Home() {
  return (
    <>
      <Head>
        <title>It Was Not a Manual :: Rank Predictions</title>
        <meta
          name="description"
          content="Rank random predictions to see if you agree with other users."
        />
        <meta property="og:image" content="/logo512.png" />
      </Head>
      <PredictionRankingComponent />
    </>
  );
}

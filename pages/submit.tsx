import Head from "next/head";
import { PredictionSubmissionComponent } from "../components/prediction/PredictionSubmissionComponent";

export default function Submit() {
  return (
    <>
      <Head>
        <title>It Was Not a Manual :: Submit Predicion</title>
        <meta
          name="description"
          content="Submit a new prediction to the catalogue."
        />
        <meta property="og:image" content="/logo512.png" />
      </Head>
      <PredictionSubmissionComponent />
    </>
  );
}

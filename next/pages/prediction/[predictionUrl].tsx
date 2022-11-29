import { InferGetServerSidePropsType } from "next/types";
import { useEffect, useState } from "react";
import { PredictionDetailsComponent } from "../../components/prediction/PredictionDetailsComponent";
import { getPredictionFromUrl } from "../../functions/getPredictions";
import { Prediction } from "../../types/prediction";

function PredictionRouteChildComponent({
  predictionUrl,
}: {
  predictionUrl: string;
}) {
  const [prediction, setPrediction] = useState<Prediction | undefined>(
    undefined
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!predictionUrl) {
      return window.location.assign("/");
    }
    getPredictionFromUrl(predictionUrl)
      .then((pred) => {
        setPrediction(pred);
        setLoading(false);
      })
      .catch(() => setError(true));
  }, [setPrediction, setLoading, setError, predictionUrl]);

  return (
    <PredictionDetailsComponent
      prediction={prediction}
      predictionLoading={loading}
      predictionError={error}
    />
  );
}

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
  return {
    props: {
      predictionUrl,
    },
  };
};

export default function Predictions({
  predictionUrl,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <PredictionRouteChildComponent predictionUrl={predictionUrl} />;
}

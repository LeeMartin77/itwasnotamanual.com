import React, { useEffect, useState } from "react";
import "./App.css";
import {
  Route,
  //Link,
  useParams,
  Routes,
  BrowserRouter,
  useNavigate,
} from "react-router-dom";
import { PredictionDetailsComponent } from "./components/prediction/PredictionDetailsComponent";
import { PredictionSummaryComponent } from "./components/prediction/PredictionSummaryComponent";
import { Prediction } from "./types/prediction";

const fakePrediction: Prediction = {
  id: "7e476c02-8aa6-4676-bd87-e24ca27710a8",
  // TODO: How do we generate this
  url: "nineteen-eighty-four-smart-speaker",
  openlibraryid: "OL1168083W",
  book_title: "Nineteen Eighty-Four",
  wiki: "Smart_speaker",
  wiki_title: "Smart speaker",
  quote:
    "He thought of the telescreen with its never-sleeping ear. They could spy upon you night and day, but if you kept your head, you could still outwit them.",
};

const predictions = [fakePrediction];

async function getPredictions() {
  // TODO: This will be on a server
  return predictions;
}

function PredictionListComponent({
  predictions,
}: {
  predictions: Prediction[];
}) {
  return (
    <>
      {predictions.map((pred) => (
        <PredictionSummaryComponent key={pred.id} prediction={pred} />
      ))}
    </>
  );
}

function PredictionListRouteChildComponent() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    getPredictions()
      .then((pred) => {
        setPredictions(pred);
        setLoading(false);
      })
      .catch(() => setError(true));
  }, [setPredictions, setLoading, setError]);

  return !loading && !error && predictions ? (
    <PredictionListComponent predictions={predictions} />
  ) : error ? (
    <div>Error!</div>
  ) : (
    <div>Loading...</div>
  );
}

async function getPredictionFromUrl(
  predictionUrl: string
): Promise<Prediction> {
  // TODO: This will be on a server
  const prediction = predictions.find((x) => x.url === predictionUrl);
  if (prediction) {
    return prediction;
  }
  throw Error("Prediction not found");
}

function PredictionRouteChildComponent() {
  const navigate = useNavigate();
  const { predictionUrl } = useParams<{ predictionUrl: string }>();
  const [prediction, setPrediction] = useState<Prediction | undefined>(
    undefined
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!predictionUrl) {
      return navigate("/");
    }
    getPredictionFromUrl(predictionUrl)
      .then((pred) => {
        setPrediction(pred);
        setLoading(false);
      })
      .catch(() => setError(true));
  }, [setPrediction, setLoading, setError, predictionUrl, navigate]);

  return !loading && !error && prediction ? (
    <PredictionDetailsComponent prediction={prediction} />
  ) : error ? (
    <div>Error!</div>
  ) : (
    <div>Loading...</div>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/prediction/:predictionUrl"
            element={<PredictionRouteChildComponent />}
          />
          <Route path="/" element={<PredictionListRouteChildComponent />} />
          <Route
            path="*"
            element={
              <main style={{ padding: "1rem" }}>
                <p>There's nothing here!</p>
              </main>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

import { useEffect, useState } from "react";
import "./App.css";
import {
  Route,
  useParams,
  Routes,
  BrowserRouter,
  useNavigate,
} from "react-router-dom";
import { PredictionDetailsComponent } from "./components/prediction/PredictionDetailsComponent";
import { Prediction } from "./types/prediction";
import { PredictionListComponent } from "./components/prediction/PredictionListComponent";
import { getPredictionFromUrl, getPredictions } from "./functions/getPredictions";

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

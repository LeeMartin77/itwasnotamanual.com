import { useEffect, useState } from "react";
import "./App.css";
import {
  Route,
  useParams,
  Routes,
  BrowserRouter,
  useNavigate
} from "react-router-dom";
import { PredictionDetailsComponent } from "./components/prediction/PredictionDetailsComponent";
import { Prediction } from "../../types/prediction";
import { PredictionListComponent } from "./components/prediction/PredictionListComponent";
import { getPredictionFromUrl, getPredictions, getRandomPrediction } from "./functions/getPredictions";
import { ThemeProvider } from "@emotion/react";
import { Container, createTheme, CssBaseline, CircularProgress, Alert } from "@mui/material";
import { BottomNavigationComponent } from "./components/navigation/BottomNavigationComponent";

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
    <Alert severity="error">Error loading predictions</Alert>
  ) : (
    <CircularProgress />
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
    <Alert severity="error">Error loading prediction</Alert>
  ) : (
    <CircularProgress />
  );
}

function PredictionRandomRouteChildComponent() {
  const [prediction, setPrediction] = useState<Prediction | undefined>(
    undefined
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    getRandomPrediction()
      .then((pred) => {
        setPrediction(pred);
        setLoading(false);
      })
      .catch(() => setError(true));
  }, [setPrediction, setLoading, setError]);

  return !loading && !error && prediction ? (
    <PredictionDetailsComponent prediction={prediction} random={true} />
  ) : error ? (
    <Alert severity="error">Error loading prediction</Alert>
  ) : (
    <CircularProgress />
  );
}

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Container component="main" maxWidth={"xs"} className="main-container">
            <Routes>
              <Route
                path="/prediction/:predictionUrl"
                element={<PredictionRouteChildComponent />}
              />
              <Route path="/predictions" element={<PredictionListRouteChildComponent />} />
              <Route path="/" element={<PredictionRandomRouteChildComponent />} />
              <Route
                path="*"
                element={
                  <main style={{ padding: "1rem" }}>
                    <p>There's nothing here!</p>
                  </main>
                }
              />
            </Routes>
          </Container>
          <BottomNavigationComponent />
        </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

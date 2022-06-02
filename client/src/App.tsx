import { useEffect, useState } from "react";
import "./App.css";
import {
  Route,
  useParams,
  Routes,
  BrowserRouter,
  Link,
  useNavigate
} from "react-router-dom";
import { PredictionDetailsComponent } from "./components/prediction/PredictionDetailsComponent";
import { Prediction } from "./types/prediction";
import { PredictionListComponent } from "./components/prediction/PredictionListComponent";
import { getPredictionFromUrl, getPredictions, getRandomPrediction } from "./functions/getPredictions";
import { ThemeProvider } from "@emotion/react";
import { Container, createTheme, CssBaseline, CircularProgress, Alert, BottomNavigation, BottomNavigationAction } from "@mui/material";
import { Shuffle, FormatListBulleted } from '@mui/icons-material';

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
      <Container component="main" maxWidth={"xs"}>
        <CssBaseline />
        <BrowserRouter>
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
          <BottomNavigation showLabels>
            <BottomNavigationAction label="Random" component={Link} to={"/"} icon={<Shuffle />} />
            <BottomNavigationAction label="List" component={Link} to={"/predictions"} icon={<FormatListBulleted />} />
          </BottomNavigation>
        </BrowserRouter>
      </Container>
    </ThemeProvider>
  );
}

export default App;

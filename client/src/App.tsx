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
import { getPredictionFromUrl, getPredictions } from "./functions/getPredictions";
import { ThemeProvider } from "@emotion/react";
import { Container, createTheme, CssBaseline, CircularProgress, Alert, Box } from "@mui/material";
import { BottomNavigationComponent } from "./components/navigation/BottomNavigationComponent";
import { SideNavigationComponent } from "./components/navigation/SideNavigationComponent";
import { PredictionSubmissionComponent } from "./components/prediction/PredictionSubmissionComponent";
import { PredictionRankingComponent } from "./components/prediction/PredictionRankingComponent";

function PredictionListRouteChildComponent() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    getPredictions()
      .then((pred) => {
        //TODO: Pagination
        setPredictions(pred.Items);
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

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [isDesktop, setDesktop] = useState(window.innerWidth > theme.breakpoints.values.sm);

  const updateMedia = () => {
    setDesktop(window.innerWidth > theme.breakpoints.values.sm);
  };

  useEffect(() => {
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  });

  const containerClassName = isDesktop ? "main-container-nonmobile" : "main-container-mobile";

  return (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>

          <Box sx={{ display: 'flex' }}>
          {isDesktop && <SideNavigationComponent />}
          <Box component="main">
            <Container maxWidth={'sm'} className={containerClassName} >
            <Routes>
              <Route path="/submit" element={<PredictionSubmissionComponent />}/>
              <Route
                path="/prediction/:predictionUrl"
                element={<PredictionRouteChildComponent />}
              />
              <Route path="/predictions" element={<PredictionListRouteChildComponent />} />
              <Route path="/" element={<PredictionRankingComponent />} />
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
          </Box>
          {!isDesktop && <BottomNavigationComponent />}
          </Box>
        </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

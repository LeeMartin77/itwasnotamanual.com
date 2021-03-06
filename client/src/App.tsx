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
import { getPredictionFromUrl } from "./functions/getPredictions";
import { ThemeProvider } from "@emotion/react";
import { Container, createTheme, CssBaseline, Box } from "@mui/material";
import { BottomNavigationComponent } from "./components/navigation/BottomNavigationComponent";
import { SideNavigationComponent } from "./components/navigation/SideNavigationComponent";
import { PredictionSubmissionComponent } from "./components/prediction/PredictionSubmissionComponent";
import { PredictionRankingComponent } from "./components/prediction/PredictionRankingComponent";
import { AboutPageComponent } from "./components/pages/AboutPageComponent";
import { FirstTimeModalComponent } from "./components/FirstTimeModalComponent";

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

  return <PredictionDetailsComponent 
    prediction={prediction} 
    predictionLoading={loading} 
    predictionError={error}/>;
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

  const mainSx = isDesktop ? {} : {minWidth: "100%"}
  return (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <FirstTimeModalComponent />
        <BrowserRouter>

          <Box sx={{ display: 'flex' }}>
          {isDesktop && <SideNavigationComponent />}
          <Box component="main" sx={mainSx}>
            <Container maxWidth={'sm'} className={containerClassName} >
            <Routes>
              <Route path="/about" element={<AboutPageComponent/>} />
              <Route path="/submit" element={<PredictionSubmissionComponent />}/>
              <Route
                path="/prediction/:predictionUrl"
                element={<PredictionRouteChildComponent />}
              />
              <Route path="/predictions" element={<PredictionListComponent />} />
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

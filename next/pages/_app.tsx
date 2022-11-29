import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@emotion/react";
import { Container, createTheme, CssBaseline, Box } from "@mui/material";
import { BottomNavigationComponent } from "../components/navigation/BottomNavigationComponent";
import { SideNavigationComponent } from "../components/navigation/SideNavigationComponent";
import { useEffect, useState } from "react";
import { FirstTimeModalComponent } from "../components/FirstTimeModalComponent";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function App({ Component, pageProps }: AppProps) {
  const [isDesktop, setDesktop] = useState(
    window.innerWidth > theme.breakpoints.values.sm
  );

  const updateMedia = () => {
    setDesktop(window.innerWidth > theme.breakpoints.values.sm);
  };

  useEffect(() => {
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  });

  const containerClassName = isDesktop
    ? "main-container-nonmobile"
    : "main-container-mobile";

  const mainSx = isDesktop ? {} : { minWidth: "100%" };
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FirstTimeModalComponent />

      <Box sx={{ display: "flex" }}>
        {isDesktop && <SideNavigationComponent />}
        <Box component="main" sx={mainSx}>
          <Container maxWidth={"sm"} className={containerClassName}>
            <Component {...pageProps} />
          </Container>
        </Box>
        {!isDesktop && <BottomNavigationComponent />}
      </Box>
    </ThemeProvider>
  );
}

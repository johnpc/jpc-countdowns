import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@aws-amplify/ui-react/styles.css";
import "./main.css";
import config from "../amplify_outputs.json";
import { Amplify } from "aws-amplify";
import {
  Theme,
  ThemeProvider,
  defaultDarkModeOverride,
} from "@aws-amplify/ui-react";
import { ColorModeProvider, useColorMode } from "./ThemeContext";
Amplify.configure(config);

const theme: Theme = {
  name: "my-theme",
  primaryColor: "blue",
  overrides: [defaultDarkModeOverride],
};

const ThemedApp = () => {
  const { colorMode } = useColorMode();
  return (
    <ThemeProvider colorMode={colorMode} theme={theme}>
      <App />
    </ThemeProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ColorModeProvider>
      <ThemedApp />
    </ColorModeProvider>
  </StrictMode>,
);

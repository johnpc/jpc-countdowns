import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@aws-amplify/ui-react/styles.css";
import config from "../amplify_outputs.json";
import { Amplify } from "aws-amplify";
import { Theme, ThemeProvider } from "@aws-amplify/ui-react";
Amplify.configure(config);

const theme: Theme = {
  name: "my-theme",
  primaryColor: "blue",
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </StrictMode>
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import { RecordsProvider } from "./context/RecordsContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/app.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <RecordsProvider>
        <App />
      </RecordsProvider>
    </ThemeProvider>
  </StrictMode>
);

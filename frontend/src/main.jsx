import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

import "./App.css";

/*
  ---------------------------------------------------------
  EduRAG Theme Initialization
  ---------------------------------------------------------

  Priority:
  1. Saved user preference: eduRAG-theme
  2. System preference
  3. Light theme fallback

  The theme class is applied before React renders so the
  application starts in the correct theme.
*/

const savedTheme = localStorage.getItem("eduRAG-theme");

const systemPrefersDark = window.matchMedia(
  "(prefers-color-scheme: dark)"
).matches;

const initialTheme =
  savedTheme === "dark" ||
  savedTheme === "light"
    ? savedTheme
    : systemPrefersDark
      ? "dark"
      : "light";

document.documentElement.classList.toggle(
  "dark",
  initialTheme === "dark"
);

document.documentElement.dataset.theme = initialTheme;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
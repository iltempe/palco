import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import { PlayerProvider } from "./context/PlayerContext";
import "./index.css";

// Service worker: rende il sito installabile e disponibile offline.
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PlayerProvider>
      <App />
    </PlayerProvider>
  </React.StrictMode>
);

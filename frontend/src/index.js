import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import "antd/dist/reset.css";
import { ensureAuthFreshness, scheduleAuthExpiryTimer } from "./utils/authSession";

// En arranque, si expiró limpiamos; programamos temporizador
ensureAuthFreshness();
scheduleAuthExpiryTimer();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

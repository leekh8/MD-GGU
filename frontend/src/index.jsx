import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./components/AuthProvider";
import App from "./App";
import "./styles.css";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>
);

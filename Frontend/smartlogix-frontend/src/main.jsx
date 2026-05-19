import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import keycloak from "./auth/keycloak.js";
import "./index.css";

keycloak
  .init({
    onLoad: "check-sso",
    pkceMethod: "S256",
    checkLoginIframe: false,
  })
  .then((authenticated) => {
    if (authenticated && keycloak.token) {
      localStorage.setItem("kc_token", keycloak.token);
    } else {
      localStorage.removeItem("kc_token");
    }

    keycloak.onTokenExpired = () => {
      keycloak
        .updateToken(30)
        .then((refreshed) => {
          if (refreshed && keycloak.token) {
            localStorage.setItem("kc_token", keycloak.token);
          }
        })
        .catch(() => {
          localStorage.removeItem("kc_token");
          keycloak.logout({
            redirectUri: "http://localhost:5173",
          });
        });
    };

    ReactDOM.createRoot(document.getElementById("root")).render(
      <React.StrictMode>
        <App keycloak={keycloak} authenticated={authenticated} />
      </React.StrictMode>
    );
  })
  .catch((error) => {
    console.error("Error al iniciar Keycloak:", error);
  });
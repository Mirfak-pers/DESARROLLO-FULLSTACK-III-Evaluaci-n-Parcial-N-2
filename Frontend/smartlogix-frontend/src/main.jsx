import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import keycloak from "./auth/keycloak.js";
import "./index.css";

const renderApp = (keycloakInstance, authenticated) => {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App keycloak={keycloakInstance} authenticated={authenticated} />
    </React.StrictMode>
  );
};

if (import.meta.env.VITE_E2E === "true") {
  const keycloakE2E = {
    authenticated: true,
    token: "token-e2e",
    tokenParsed: {
      preferred_username: "usuario-e2e",
      name: "Usuario E2E",
    },
    isTokenExpired: () => false,
    updateToken: () => Promise.resolve(true),
    login: () => {},
    logout: () => {},
  };

  localStorage.setItem("kc_token", "token-e2e");
  renderApp(keycloakE2E, true);
} else {
  keycloak
    .init({
      onLoad: "login-required",
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

      renderApp(keycloak, authenticated);
    })
    .catch((error) => {
      console.error("Error al iniciar Keycloak:", error);
    });
}
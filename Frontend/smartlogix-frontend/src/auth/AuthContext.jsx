import { createContext, useContext, useEffect, useMemo, useState } from "react";
import keycloak from "./keycloak";

const AuthContext = createContext(null);
let keycloakInitPromise = null;

function obtenerRoles(tokenParsed) {
  if (!tokenParsed) return [];

  const realmRoles = tokenParsed.realm_access?.roles || [];
  const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "smartlogix-app";
  const clientRoles = tokenParsed.resource_access?.[clientId]?.roles || [];

  return [...new Set([...realmRoles, ...clientRoles])];
}

export function AuthProvider({ children }) {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);

  const actualizarSesion = () => {
    setAuthenticated(Boolean(keycloak.authenticated));
    setUser(keycloak.tokenParsed || null);
  };

  useEffect(() => {
    if (!keycloakInitPromise) {
      keycloakInitPromise = keycloak.init({
        onLoad: "login-required",
        pkceMethod: "S256",
        checkLoginIframe: false,
        redirectUri: window.location.origin,
      });
    }

    keycloakInitPromise
      .then(() => {
        actualizarSesion();
        setInitialized(true);

        keycloak.onAuthSuccess = actualizarSesion;
        keycloak.onAuthRefreshSuccess = actualizarSesion;
        keycloak.onAuthLogout = () => {
          setAuthenticated(false);
          setUser(null);
        };
        keycloak.onTokenExpired = () => {
          keycloak.updateToken(30).then(actualizarSesion).catch(() => keycloak.login({ redirectUri: window.location.origin }));
        };

        const refreshInterval = setInterval(() => {
          if (keycloak.authenticated) {
            keycloak.updateToken(30).then(actualizarSesion).catch(() => keycloak.login({ redirectUri: window.location.origin }));
          }
        }, 20000);

        return () => clearInterval(refreshInterval);
      })
      .catch((error) => {
        console.error("Error inicializando Keycloak", error);
        setAuthError(error);
        setInitialized(true);
      });
  }, []);

  const roles = obtenerRoles(user);

  const value = useMemo(
    () => ({
      initialized,
      authenticated,
      user,
      roles,
      token: keycloak.token,
      authError,
      login: () => keycloak.login({ redirectUri: window.location.origin }),
      logout: () => keycloak.logout({ redirectUri: window.location.origin }),
      hasRole: (role) => roles.includes(role),
    }),
    [initialized, authenticated, user, roles, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}

import axios from "axios";
import keycloak from "../auth/keycloak";

/**
 * Cliente HTTP centralizado para todos los microservicios.
 *
 * - En desarrollo Vite proxea /api/* a cada microservicio (ver vite.config.js)
 * - En producción Docker, nginx enruta según el path
 *
 * Token: se lee directamente del objeto Keycloak (keycloak.token) en lugar de
 * localStorage, ya que Keycloak puede renovar el token internamente sin que
 * localStorage se actualice a tiempo. Si el token está próximo a expirar,
 * Keycloak lo refresca antes de adjuntarlo.
 */
const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Interceptor de request: adjunta el token JWT actualizado ─────────────────
apiClient.interceptors.request.use(async (config) => {
  try {
    // Refresca el token si expira en menos de 30 segundos
    if (keycloak.isTokenExpired(30)) {
      await keycloak.updateToken(30);
    }
    if (keycloak.token) {
      config.headers.Authorization = `Bearer ${keycloak.token}`;
      // Mantener localStorage sincronizado por compatibilidad
      localStorage.setItem("kc_token", keycloak.token);
    }
  } catch {
    // Si no se puede refrescar, intenta con lo que hay en localStorage como fallback
    const token = localStorage.getItem("kc_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Interceptor de response: manejo global de 401 ────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Token expirado a pesar del refresh → forzar logout
      console.warn("[apiClient] 401 recibido — sesión expirada, redirigiendo a login...");
      localStorage.removeItem("kc_token");
      keycloak.logout({ redirectUri: window.location.origin });
    }
    return Promise.reject(error);
  }
);

export default apiClient;

import axios from "axios";
import keycloak from "../auth/keycloak";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BFF_URL || "http://localhost:8083/api/bff",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  if (keycloak.authenticated) {
    await keycloak.updateToken(30);
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error("Acceso rechazado por Keycloak o token inválido");
    }
    return Promise.reject(error);
  }
);

export default apiClient;

import axios from "axios";

// En desarrollo, Vite proxea /api/* a los microservicios
// En producción con Docker, nginx enruta según el path
const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token de Keycloak si está disponible
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("kc_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;

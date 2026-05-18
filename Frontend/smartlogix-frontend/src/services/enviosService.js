import apiClient from "../api/apiClient";

export const obtenerEnvios = async () => {
  const response = await apiClient.get("/envios");
  return response.data;
};

export const crearEnvio = async (envio) => {
  const response = await apiClient.post("/envios", envio);
  return response.data;
};

export const actualizarEstadoEnvio = async (id, estado) => {
  const response = await apiClient.put(`/envios/${id}/estado`, { estado });
  return response.data;
};
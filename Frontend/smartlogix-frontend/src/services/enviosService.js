import apiClient from "../api/apiClient";

export const obtenerEnvios = async () => {
  const response = await apiClient.get("/envios");
  return response.data;
};

export const obtenerEnvioPorId = async (id) => {
  const response = await apiClient.get(`/envios/${id}`);
  return response.data;
};

export const crearEnvio = async (envio) => {
  const response = await apiClient.post("/envios", envio);
  return response.data;
};

export const actualizarEstadoEnvio = async (id, estado) => {
  const response = await apiClient.patch(`/envios/${id}/estado`, {
    nuevoEstado: estado,
  });
  return response.data;
};

export const eliminarEnvio = async (id) => {
  const response = await apiClient.delete(`/envios/${id}`);
  return response.data;
};
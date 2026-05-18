import apiClient from "../api/apiClient";

export const obtenerPedidos = async () => {
  const response = await apiClient.get("/pedidos");
  return response.data;
};

export const crearPedido = async (pedido) => {
  const response = await apiClient.post("/pedidos", pedido);
  return response.data;
};

export const aprobarPedido = async (id) => {
  const response = await apiClient.post(`/pedidos/${id}/aprobar`);
  return response.data;
};
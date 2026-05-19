import apiClient from "../api/apiClient";

export const obtenerPedidos = async () => {
  const response = await apiClient.get("/pedidos");
  return response.data;
};

export const crearPedido = async (pedido) => {
  // El backend espera { cliente, detalles: [{productoId, cantidad}] }
  // El frontend envía { cliente, items: [{productoId, cantidad}] }
  // Normalizar aquí:
  const payload = {
    cliente: pedido.cliente,
    detalles: pedido.items || pedido.detalles || [],
  };
  const response = await apiClient.post("/pedidos", payload);
  return response.data;
};

export const cambiarEstadoPedido = async (id, estado) => {
  const response = await apiClient.patch(`/pedidos/${id}/estado`, { estado });
  return response.data;
};

// Alias para compatibilidad con Pedidos.jsx
export const aprobarPedido = async (id) => {
  return cambiarEstadoPedido(id, "APROBADO");
};

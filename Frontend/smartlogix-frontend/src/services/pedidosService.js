import apiClient from "../api/apiClient";

/**
 * Servicio de pedidos.
 * Normaliza el payload antes de enviarlo al backend:
 *   - El backend espera `detalles` (no `items`)
 *   - Convierte productoId y cantidad a Number para evitar strings
 */

export const obtenerPedidos = async () => {
  const response = await apiClient.get("/pedidos");
  return response.data;
};

export const obtenerPedidoPorId = async (id) => {
  const response = await apiClient.get(`/pedidos/${id}`);
  return response.data;
};

export const crearPedido = async (pedido) => {
  // Acepta { cliente, items: [{productoId, cantidad}] }
  // o     { cliente, detalles: [{productoId, cantidad}] }
  const detalles = (pedido.detalles || pedido.items || []).map((d) => ({
    productoId: Number(d.productoId),
    cantidad: Number(d.cantidad),
  }));

  const payload = {
    cliente: pedido.cliente,
    detalles,
  };

  const response = await apiClient.post("/pedidos", payload);
  return response.data;
};

export const cambiarEstadoPedido = async (id, estado) => {
  const response = await apiClient.patch(`/pedidos/${id}/estado`, { estado });
  return response.data;
};

export const aprobarPedido = async (id) => cambiarEstadoPedido(id, "APROBADO");

export const rechazarPedido = async (id) => cambiarEstadoPedido(id, "RECHAZADO");

export const obtenerDetallePedido = async (id) => {
  const response = await apiClient.get(`/pedidos/${id}/detalles`);
  return response.data;
};

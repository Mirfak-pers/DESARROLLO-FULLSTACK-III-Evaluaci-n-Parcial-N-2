import apiClient from "../api/apiClient";

export const obtenerPedidos = async () => {
  const response = await apiClient.get("/pedidos");
  return response.data;
};

export const obtenerPedidoPorId = async (id) => {
  const response = await apiClient.get(`/pedidos/${id}`);
  return response.data;
};

export const crearPedido = async (pedido) => {
  // El backend espera: { cliente, detalles: [{ productoId, cantidad }] }
  // El frontend envía:  { cliente, items:   [{ productoId, cantidad }] }
  const detalles = (pedido.detalles || pedido.items || []).map((item) => ({
    productoId: Number(item.productoId),
    cantidad:   Number(item.cantidad),
  }));

  const payload = {
    cliente:  pedido.cliente,
    detalles: detalles,
  };

  const response = await apiClient.post("/pedidos", payload);
  return response.data;
};

export const cambiarEstadoPedido = async (id, estado, datosEnvio = {}) => {
  const response = await apiClient.patch(`/pedidos/${id}/estado`, {
    estado,
    ...datosEnvio,
  });
  return response.data;
};

export const aprobarPedido = async (id, datosEnvio = {}) => {
  return cambiarEstadoPedido(id, "APROBADO", datosEnvio);
};

export const rechazarPedido = async (id) => {
  return cambiarEstadoPedido(id, "RECHAZADO");
};
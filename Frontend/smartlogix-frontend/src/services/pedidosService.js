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
  const payload = {
    cliente: pedido.cliente,
    detalles: pedido.detalles || pedido.items || [
      {
        productoId: Number(pedido.productoId),
        cantidad: Number(pedido.cantidad),
      },
    ],
  };

  const response = await apiClient.post("/pedidos", payload);
  return response.data;
};

export const cambiarEstadoPedido = async (id, estado) => {
  const response = await apiClient.patch(`/pedidos/${id}/estado`, {
    estado,
  });

  return response.data;
};

export const aprobarPedido = async (id) => {
  return cambiarEstadoPedido(id, "APROBADO");
};

export const rechazarPedido = async (id) => {
  return cambiarEstadoPedido(id, "RECHAZADO");
};
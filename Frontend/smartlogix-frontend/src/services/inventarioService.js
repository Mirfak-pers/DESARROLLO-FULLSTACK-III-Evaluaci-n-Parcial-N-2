import apiClient from "../api/apiClient";

export const obtenerProductos = async () => {
  const response = await apiClient.get("/inventario/productos");
  return response.data;
};

export const crearProducto = async (producto) => {
  const response = await apiClient.post("/inventario/productos", producto);
  return response.data;
};

export const actualizarStock = async (id, cantidad) => {
  const response = await apiClient.patch(`/inventario/productos/${id}/stock`, { cantidad });
  return response.data;
};

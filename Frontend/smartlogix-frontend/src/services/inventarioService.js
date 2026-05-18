import apiClient from "../api/apiClient";

export const obtenerProductos = async () => {
  const response = await apiClient.get("/productos");
  return response.data;
};

export const crearProducto = async (producto) => {
  const response = await apiClient.post("/productos", producto);
  return response.data;
};

export const actualizarStock = async (id, stock) => {
  const response = await apiClient.put(`/productos/${id}/stock`, { stock });
  return response.data;
};
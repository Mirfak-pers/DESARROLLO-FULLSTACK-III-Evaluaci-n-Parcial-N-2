import apiClient from "../api/apiClient";

export const listarUsuarios = async () => {
  const response = await apiClient.get("/api/usuarios");
  return response.data;
};

export const crearUsuario = async (usuario) => {
  const response = await apiClient.post("/api/usuarios", usuario);
  return response.data;
};

export const actualizarUsuario = async (id, usuario) => {
  const response = await apiClient.put(`/api/usuarios/${id}`, usuario);
  return response.data;
};

export const eliminarUsuario = async (id) => {
  const response = await apiClient.delete(`/api/usuarios/${id}`);
  return response.data;
};
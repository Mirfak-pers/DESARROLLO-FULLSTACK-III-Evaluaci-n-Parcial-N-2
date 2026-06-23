import apiClient from "../api/apiClient";

export const listarUsuarios = async () => {
  const response = await apiClient.get("/usuarios");
  return response.data;
};

export const obtenerUsuarioPorId = async (id) => {
  const response = await apiClient.get(`/usuarios/${id}`);
  return response.data;
};

export const crearUsuario = async (usuario) => {
  const response = await apiClient.post("/usuarios/registro", usuario);
  return response.data;
};

export const actualizarUsuario = async (id, usuario) => {
  const response = await apiClient.put(`/usuarios/${id}`, usuario);
  return response.data;
};

export const eliminarUsuario = async (id) => {
  const response = await apiClient.delete(`/usuarios/${id}`);
  return response.data;
};

export const loginUsuario = async (credenciales) => {
  const response = await apiClient.post("/usuarios/login", credenciales);
  return response.data;
};
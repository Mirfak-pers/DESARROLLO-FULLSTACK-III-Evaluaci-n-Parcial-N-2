// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

const { axiosMock } = vi.hoisted(() => {
  const mock = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    create: vi.fn(),
  };

  mock.create.mockReturnValue(mock);
  return { axiosMock: mock };
});

vi.mock("axios", () => ({ default: axiosMock }));

vi.mock("../src/auth/keycloak.js", () => ({
  default: {
    token: "token-prueba",
    isTokenExpired: vi.fn(() => false),
    updateToken: vi.fn(),
    logout: vi.fn(),
  },
}));

import {
  actualizarUsuario,
  crearUsuario,
  eliminarUsuario,
  listarUsuarios,
  loginUsuario,
  obtenerUsuarioPorId,
} from "../src/services/usuariosService.js";

describe("usuariosService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("lista usuarios desde /usuarios", async () => {
    const usuarios = [
      {
        id: 1,
        nombre: "Admin SmartLogix",
        email: "admin@smartlogix.cl",
        rol: "ADMIN",
      },
      {
        id: 2,
        nombre: "Cliente Prueba",
        email: "cliente@smartlogix.cl",
        rol: "CLIENTE",
      },
    ];

    axiosMock.get.mockResolvedValueOnce({ data: usuarios });

    const resultado = await listarUsuarios();

    expect(axiosMock.get).toHaveBeenCalledWith("/usuarios");
    expect(resultado).toEqual(usuarios);
  });

  it("obtiene un usuario por ID desde /usuarios/{id}", async () => {
    const usuario = {
      id: 1,
      nombre: "Admin SmartLogix",
      email: "admin@smartlogix.cl",
      rol: "ADMIN",
    };

    axiosMock.get.mockResolvedValueOnce({ data: usuario });

    const resultado = await obtenerUsuarioPorId(1);

    expect(axiosMock.get).toHaveBeenCalledWith("/usuarios/1");
    expect(resultado).toEqual(usuario);
  });

  it("crea un usuario usando /usuarios/registro", async () => {
    const nuevoUsuario = {
      nombre: "Nuevo Usuario",
      email: "nuevo@smartlogix.cl",
      password: "123456",
      rol: "CLIENTE",
    };

    const usuarioCreado = {
      id: 3,
      nombre: "Nuevo Usuario",
      email: "nuevo@smartlogix.cl",
      rol: "CLIENTE",
    };

    axiosMock.post.mockResolvedValueOnce({ data: usuarioCreado });

    const resultado = await crearUsuario(nuevoUsuario);

    expect(axiosMock.post).toHaveBeenCalledWith(
      "/usuarios/registro",
      nuevoUsuario
    );
    expect(resultado).toEqual(usuarioCreado);
  });

  it("actualiza un usuario usando /usuarios/{id}", async () => {
    const datosActualizados = {
      nombre: "Usuario Actualizado",
      email: "actualizado@smartlogix.cl",
      rol: "OPERADOR",
    };

    const usuarioActualizado = {
      id: 1,
      ...datosActualizados,
    };

    axiosMock.put.mockResolvedValueOnce({ data: usuarioActualizado });

    const resultado = await actualizarUsuario(1, datosActualizados);

    expect(axiosMock.put).toHaveBeenCalledWith(
      "/usuarios/1",
      datosActualizados
    );
    expect(resultado).toEqual(usuarioActualizado);
  });

  it("elimina un usuario usando /usuarios/{id}", async () => {
    axiosMock.delete.mockResolvedValueOnce({ data: undefined });

    const resultado = await eliminarUsuario(1);

    expect(axiosMock.delete).toHaveBeenCalledWith("/usuarios/1");
    expect(resultado).toBeUndefined();
  });

  it("realiza login usando /usuarios/login", async () => {
    const credenciales = {
      email: "admin@smartlogix.cl",
      password: "123456",
    };

    const respuestaLogin = {
      mensaje: "Login exitoso",
      usuario: {
        id: 1,
        email: "admin@smartlogix.cl",
        rol: "ADMIN",
      },
    };

    axiosMock.post.mockResolvedValueOnce({ data: respuestaLogin });

    const resultado = await loginUsuario(credenciales);

    expect(axiosMock.post).toHaveBeenCalledWith(
      "/usuarios/login",
      credenciales
    );
    expect(resultado).toEqual(respuestaLogin);
  });
});
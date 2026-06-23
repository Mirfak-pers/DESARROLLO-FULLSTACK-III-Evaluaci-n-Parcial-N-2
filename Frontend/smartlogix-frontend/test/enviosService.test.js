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
  actualizarEstadoEnvio,
  crearEnvio,
  eliminarEnvio,
  obtenerEnvioPorId,
  obtenerEnvios,
} from "../src/services/enviosService.js";

describe("enviosService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("lista envíos desde /envios", async () => {
    const envios = [
      {
        id: 1,
        pedidoId: 1,
        usuarioId: 1,
        direccionDestino: "Av. Siempre Viva 123",
        ciudadDestino: "Santiago",
        regionDestino: "Metropolitana",
        estado: "PENDIENTE",
      },
      {
        id: 2,
        pedidoId: 2,
        usuarioId: 2,
        direccionDestino: "Los Leones 456",
        ciudadDestino: "Providencia",
        regionDestino: "Metropolitana",
        estado: "ENTREGADO",
      },
    ];

    axiosMock.get.mockResolvedValueOnce({ data: envios });

    const resultado = await obtenerEnvios();

    expect(axiosMock.get).toHaveBeenCalledWith("/envios");
    expect(resultado).toEqual(envios);
  });

  it("obtiene un envío por ID desde /envios/{id}", async () => {
    const envio = {
      id: 1,
      pedidoId: 1,
      usuarioId: 1,
      direccionDestino: "Av. Siempre Viva 123",
      ciudadDestino: "Santiago",
      regionDestino: "Metropolitana",
      estado: "PENDIENTE",
    };

    axiosMock.get.mockResolvedValueOnce({ data: envio });

    const resultado = await obtenerEnvioPorId(1);

    expect(axiosMock.get).toHaveBeenCalledWith("/envios/1");
    expect(resultado).toEqual(envio);
  });

  it("crea un envío en /envios", async () => {
    const nuevoEnvio = {
      pedidoId: 1,
      usuarioId: 1,
      direccionDestino: "Av. Siempre Viva 123",
      ciudadDestino: "Santiago",
      regionDestino: "Metropolitana",
      transportista: "Chilexpress",
      fechaEntregaEstimada: "2026-06-25T12:00",
    };

    const envioCreado = {
      id: 1,
      numeroSeguimiento: "ENV-001",
      estado: "PENDIENTE",
      ...nuevoEnvio,
    };

    axiosMock.post.mockResolvedValueOnce({ data: envioCreado });

    const resultado = await crearEnvio(nuevoEnvio);

    expect(axiosMock.post).toHaveBeenCalledWith("/envios", nuevoEnvio);
    expect(resultado).toEqual(envioCreado);
  });

  it("actualiza el estado de un envío", async () => {
    const envioActualizado = {
      id: 1,
      pedidoId: 1,
      usuarioId: 1,
      estado: "ENTREGADO",
    };

    axiosMock.patch.mockResolvedValueOnce({ data: envioActualizado });

    const resultado = await actualizarEstadoEnvio(1, "ENTREGADO");

    expect(axiosMock.patch).toHaveBeenCalledWith("/envios/1/estado", {
      nuevoEstado: "ENTREGADO",
    });

    expect(resultado).toEqual(envioActualizado);
  });

  it("elimina un envío desde /envios/{id}", async () => {
    axiosMock.delete.mockResolvedValueOnce({ data: undefined });

    const resultado = await eliminarEnvio(1);

    expect(axiosMock.delete).toHaveBeenCalledWith("/envios/1");
    expect(resultado).toBeUndefined();
  });
});
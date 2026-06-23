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
  aprobarPedido,
  cambiarEstadoPedido,
  crearPedido,
  obtenerDetallePedido,
  obtenerPedidoPorId,
  obtenerPedidos,
  rechazarPedido,
} from "../src/services/pedidosService.js";

describe("pedidosService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("lista pedidos desde /pedidos", async () => {
    const pedidos = [
      { id: 1, cliente: "Cliente 1", estado: "CREADO", total: 10000 },
      { id: 2, cliente: "Cliente 2", estado: "APROBADO", total: 25000 },
    ];

    axiosMock.get.mockResolvedValueOnce({ data: pedidos });

    const resultado = await obtenerPedidos();

    expect(axiosMock.get).toHaveBeenCalledWith("/pedidos");
    expect(resultado).toEqual(pedidos);
  });

  it("obtiene un pedido por ID desde /pedidos/{id}", async () => {
    const pedido = {
      id: 1,
      cliente: "Cliente prueba",
      estado: "CREADO",
      total: 15000,
    };

    axiosMock.get.mockResolvedValueOnce({ data: pedido });

    const resultado = await obtenerPedidoPorId(1);

    expect(axiosMock.get).toHaveBeenCalledWith("/pedidos/1");
    expect(resultado).toEqual(pedido);
  });

  it("crea un pedido normalizando items a detalles", async () => {
    const nuevoPedido = {
      cliente: "Cliente prueba",
      items: [
        { productoId: "1", cantidad: "2" },
        { productoId: "3", cantidad: "1" },
      ],
    };

    const pedidoCreado = {
      id: 1,
      cliente: "Cliente prueba",
      estado: "CREADO",
      detalles: [
        { productoId: 1, cantidad: 2 },
        { productoId: 3, cantidad: 1 },
      ],
    };

    axiosMock.post.mockResolvedValueOnce({ data: pedidoCreado });

    const resultado = await crearPedido(nuevoPedido);

    expect(axiosMock.post).toHaveBeenCalledWith("/pedidos", {
      cliente: "Cliente prueba",
      detalles: [
        { productoId: 1, cantidad: 2 },
        { productoId: 3, cantidad: 1 },
      ],
    });

    expect(resultado).toEqual(pedidoCreado);
  });

  it("cambia el estado de un pedido", async () => {
    const pedidoActualizado = {
      id: 1,
      estado: "APROBADO",
    };

    axiosMock.patch.mockResolvedValueOnce({ data: pedidoActualizado });

    const resultado = await cambiarEstadoPedido(1, "APROBADO");

    expect(axiosMock.patch).toHaveBeenCalledWith("/pedidos/1/estado", {
      estado: "APROBADO",
    });

    expect(resultado).toEqual(pedidoActualizado);
  });

  it("aprueba un pedido usando estado APROBADO", async () => {
    const pedidoActualizado = {
      id: 1,
      estado: "APROBADO",
    };

    axiosMock.patch.mockResolvedValueOnce({ data: pedidoActualizado });

    const resultado = await aprobarPedido(1);

    expect(axiosMock.patch).toHaveBeenCalledWith("/pedidos/1/estado", {
      estado: "APROBADO",
    });

    expect(resultado).toEqual(pedidoActualizado);
  });

  it("rechaza un pedido usando estado RECHAZADO", async () => {
    const pedidoActualizado = {
      id: 1,
      estado: "RECHAZADO",
    };

    axiosMock.patch.mockResolvedValueOnce({ data: pedidoActualizado });

    const resultado = await rechazarPedido(1);

    expect(axiosMock.patch).toHaveBeenCalledWith("/pedidos/1/estado", {
      estado: "RECHAZADO",
    });

    expect(resultado).toEqual(pedidoActualizado);
  });

  it("obtiene el detalle de un pedido", async () => {
    const detalle = [
      { id: 1, productoId: 1, cantidad: 2 },
      { id: 2, productoId: 3, cantidad: 1 },
    ];

    axiosMock.get.mockResolvedValueOnce({ data: detalle });

    const resultado = await obtenerDetallePedido(1);

    expect(axiosMock.get).toHaveBeenCalledWith("/pedidos/1/detalles");
    expect(resultado).toEqual(detalle);
  });
});
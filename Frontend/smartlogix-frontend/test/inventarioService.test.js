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
  actualizarStock,
  crearProducto,
  obtenerProductos,
} from "../src/services/inventarioService.js";

describe("inventarioService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("lista productos desde /inventario/productos", async () => {
    const productos = [
      { id: 1, codigo: "PROD-001", nombre: "Teclado", stock: 10 },
      { id: 2, codigo: "PROD-002", nombre: "Mouse", stock: 20 },
    ];

    axiosMock.get.mockResolvedValueOnce({ data: productos });

    const resultado = await obtenerProductos();

    expect(axiosMock.get).toHaveBeenCalledWith("/inventario/productos");
    expect(resultado).toEqual(productos);
  });

  it("crea un producto en /inventario/productos", async () => {
    const nuevoProducto = {
      codigo: "PROD-003",
      nombre: "Monitor",
      descripcion: "Monitor 24 pulgadas",
      precio: 89990,
      stock: 15,
    };

    const productoCreado = { id: 3, ...nuevoProducto };

    axiosMock.post.mockResolvedValueOnce({ data: productoCreado });

    const resultado = await crearProducto(nuevoProducto);

    expect(axiosMock.post).toHaveBeenCalledWith(
      "/inventario/productos",
      nuevoProducto
    );
    expect(resultado).toEqual(productoCreado);
  });

  it("actualiza stock de un producto", async () => {
    const stockActualizado = {
      id: 1,
      codigo: "PROD-001",
      nombre: "Teclado",
      stock: 25,
    };

    axiosMock.patch.mockResolvedValueOnce({ data: stockActualizado });

    const resultado = await actualizarStock(1, 25);

    expect(axiosMock.patch).toHaveBeenCalledWith(
      "/inventario/productos/1/stock",
      { cantidad: 25 }
    );
    expect(resultado).toEqual(stockActualizado);
  });
});
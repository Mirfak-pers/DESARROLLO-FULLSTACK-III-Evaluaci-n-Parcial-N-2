// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest"

const { axiosMock } = vi.hoisted(() => {
  const mock = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),

    interceptors: {
      request: {
        use: vi.fn(),
      },
      response: {
        use: vi.fn(),
      },
    },

    create: vi.fn(),
  }

  mock.create.mockReturnValue(mock)

  return {
    axiosMock: mock,
  }
})

vi.mock("axios", () => ({
  default: axiosMock,
}))

import * as inventarioService from "../src/services/inventarioService.js"

function obtenerFuncion(servicio, nombres) {
  const nombreFuncion = nombres.find(
    (nombre) => typeof servicio[nombre] === "function"
  )

  if (!nombreFuncion) {
    throw new Error(
      `No se encontró ninguna función con estos nombres: ${nombres.join(", ")}`
    )
  }

  return servicio[nombreFuncion]
}

describe("inventarioService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it("lista productos desde la API de inventario", async () => {
    const productos = [
      { id: 1, codigo: "PROD-001", nombre: "Teclado", stock: 10 },
      { id: 2, codigo: "PROD-002", nombre: "Mouse", stock: 20 },
    ]

    axiosMock.get.mockResolvedValueOnce({ data: productos })

    const listarProductos = obtenerFuncion(inventarioService, [
      "listarProductos",
      "obtenerProductos",
      "getProductos",
      "getInventario",
      "listarInventario",
    ])

    const resultado = await listarProductos()

    expect(axiosMock.get).toHaveBeenCalled()
    expect(resultado).toEqual(productos)
  })

  it("crea un producto enviando datos a la API", async () => {
    const nuevoProducto = {
      codigo: "PROD-003",
      nombre: "Monitor",
      stock: 15,
    }

    const productoCreado = {
      id: 3,
      ...nuevoProducto,
    }

    axiosMock.post.mockResolvedValueOnce({ data: productoCreado })

    const crearProducto = obtenerFuncion(inventarioService, [
      "crearProducto",
      "registrarProducto",
      "guardarProducto",
      "agregarProducto",
    ])

    const resultado = await crearProducto(nuevoProducto)

    expect(axiosMock.post).toHaveBeenCalled()
    expect(axiosMock.post.mock.calls[0][1]).toEqual(nuevoProducto)
    expect(resultado).toEqual(productoCreado)
  })

  it("actualiza stock de un producto", async () => {
    const stockActualizado = {
      id: 1,
      codigo: "PROD-001",
      nombre: "Teclado",
      stock: 25,
    }

    axiosMock.put.mockResolvedValueOnce({ data: stockActualizado })
    axiosMock.patch.mockResolvedValueOnce({ data: stockActualizado })
    axiosMock.post.mockResolvedValueOnce({ data: stockActualizado })

    const actualizarStock = obtenerFuncion(inventarioService, [
      "actualizarStock",
      "modificarStock",
      "cambiarStock",
      "reponerStock",
      "descontarStock",
    ])

    const resultado = await actualizarStock(1, 25)

    expect(
      axiosMock.put.mock.calls.length +
        axiosMock.patch.mock.calls.length +
        axiosMock.post.mock.calls.length
    ).toBeGreaterThan(0)

    expect(resultado).toEqual(stockActualizado)
  })
})
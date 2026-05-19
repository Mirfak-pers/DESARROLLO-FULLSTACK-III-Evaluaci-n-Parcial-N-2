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

import * as pedidosService from "../src/services/pedidosService.js"

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

describe("pedidosService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it("lista pedidos desde la API", async () => {
    const pedidos = [
      { id: 1, estado: "Creado", total: 10000 },
      { id: 2, estado: "Aprobado", total: 25000 },
    ]

    axiosMock.get.mockResolvedValueOnce({ data: pedidos })

    const listarPedidos = obtenerFuncion(pedidosService, [
      "listarPedidos",
      "obtenerPedidos",
      "getPedidos",
    ])

    const resultado = await listarPedidos()

    expect(axiosMock.get).toHaveBeenCalled()
    expect(resultado).toEqual(pedidos)
  })

  it("crea un pedido enviando datos a la API", async () => {
    const pedidoCreado = {
      id: 1,
      estado: "Creado",
      cliente: "Cliente prueba",
      detalles: [
        {
          productoId: 1,
          cantidad: 2,
        },
      ],
    }

    axiosMock.post.mockResolvedValueOnce({ data: pedidoCreado })

    const crearPedido = obtenerFuncion(pedidosService, [
      "crearPedido",
      "registrarPedido",
      "guardarPedido",
      "agregarPedido",
    ])

    const resultado = await crearPedido("Cliente prueba", [
      {
        productoId: 1,
        cantidad: 2,
      },
    ])

    expect(axiosMock.post).toHaveBeenCalled()

    const datosEnviados = axiosMock.post.mock.calls[0][1]

    expect(datosEnviados).toHaveProperty("cliente")
    expect(datosEnviados).toHaveProperty("detalles")
    expect(Array.isArray(datosEnviados.detalles)).toBe(true)

    expect(resultado).toEqual(pedidoCreado)
  })

  it("actualiza el estado de un pedido", async () => {
    const pedidoActualizado = {
      id: 1,
      estado: "Aprobado",
    }

    axiosMock.put.mockResolvedValueOnce({ data: pedidoActualizado })
    axiosMock.patch.mockResolvedValueOnce({ data: pedidoActualizado })
    axiosMock.post.mockResolvedValueOnce({ data: pedidoActualizado })

    const actualizarEstado = obtenerFuncion(pedidosService, [
      "actualizarEstadoPedido",
      "cambiarEstadoPedido",
      "actualizarPedido",
      "aprobarPedido",
      "rechazarPedido",
    ])

    const resultado = await actualizarEstado(1, "Aprobado")

    expect(
      axiosMock.put.mock.calls.length +
        axiosMock.patch.mock.calls.length +
        axiosMock.post.mock.calls.length
    ).toBeGreaterThan(0)

    expect(resultado).toEqual(pedidoActualizado)
  })
})
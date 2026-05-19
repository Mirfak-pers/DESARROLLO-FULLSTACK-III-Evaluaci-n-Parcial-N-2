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

import * as enviosService from "../src/services/enviosService.js"

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

describe("enviosService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it("lista envíos desde la API", async () => {
    const envios = [
      {
        id: 1,
        pedidoId: 10,
        estado: "Pendiente",
        direccion: "Av. Principal 123",
      },
      {
        id: 2,
        pedidoId: 11,
        estado: "En tránsito",
        direccion: "Calle Norte 456",
      },
    ]

    axiosMock.get.mockResolvedValueOnce({ data: envios })

    const listarEnvios = obtenerFuncion(enviosService, [
      "listarEnvios",
      "obtenerEnvios",
      "getEnvios",
    ])

    const resultado = await listarEnvios()

    expect(axiosMock.get).toHaveBeenCalled()
    expect(resultado).toEqual(envios)
  })

  it("crea un envío enviando datos a la API", async () => {
    const nuevoEnvio = {
      pedidoId: 10,
      direccion: "Av. Principal 123",
      transportista: "Chilexpress",
      fechaEstimada: "2026-05-20",
    }

    const envioCreado = {
      id: 1,
      estado: "Pendiente",
      ...nuevoEnvio,
    }

    axiosMock.post.mockResolvedValueOnce({ data: envioCreado })

    const crearEnvio = obtenerFuncion(enviosService, [
      "crearEnvio",
      "registrarEnvio",
      "guardarEnvio",
      "generarEnvio",
    ])

    const resultado = await crearEnvio(nuevoEnvio)

    expect(axiosMock.post).toHaveBeenCalled()

    const datosEnviados = axiosMock.post.mock.calls[0][1]

    expect(datosEnviados).toBeDefined()
    expect(resultado).toEqual(envioCreado)
  })

  it("actualiza el estado de un envío", async () => {
    const envioActualizado = {
      id: 1,
      pedidoId: 10,
      estado: "Entregado",
    }

    axiosMock.put.mockResolvedValueOnce({ data: envioActualizado })
    axiosMock.patch.mockResolvedValueOnce({ data: envioActualizado })
    axiosMock.post.mockResolvedValueOnce({ data: envioActualizado })

    const actualizarEstado = obtenerFuncion(enviosService, [
      "actualizarEstadoEnvio",
      "cambiarEstadoEnvio",
      "actualizarEnvio",
    ])

    const resultado = await actualizarEstado(1, "Entregado")

    expect(
      axiosMock.put.mock.calls.length +
        axiosMock.patch.mock.calls.length +
        axiosMock.post.mock.calls.length
    ).toBeGreaterThan(0)

    expect(resultado).toEqual(envioActualizado)
  })
})
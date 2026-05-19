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

import * as usuariosService from "../src/services/usuariosService.js"

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

describe("usuariosService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it("lista usuarios desde la API", async () => {
    const usuarios = [
      {
        id: 1,
        nombre: "Admin",
        email: "admin@smartlogix.cl",
        rol: "ADMIN",
      },
      {
        id: 2,
        nombre: "Operador",
        email: "operador@smartlogix.cl",
        rol: "OPERADOR",
      },
    ]

    axiosMock.get.mockResolvedValueOnce({ data: usuarios })

    const listarUsuarios = obtenerFuncion(usuariosService, [
      "listarUsuarios",
      "obtenerUsuarios",
      "getUsuarios",
    ])

    const resultado = await listarUsuarios()

    expect(axiosMock.get).toHaveBeenCalled()
    expect(resultado).toEqual(usuarios)
  })

  it("crea un usuario enviando datos a la API", async () => {
    const nuevoUsuario = {
      nombre: "Felipe",
      email: "felipe@test.cl",
      rol: "ADMIN",
    }

    const usuarioCreado = {
      id: 1,
      ...nuevoUsuario,
    }

    axiosMock.post.mockResolvedValueOnce({ data: usuarioCreado })

    const crearUsuario = obtenerFuncion(usuariosService, [
      "crearUsuario",
      "registrarUsuario",
      "guardarUsuario",
      "agregarUsuario",
    ])

    const resultado = await crearUsuario(nuevoUsuario)

    expect(axiosMock.post).toHaveBeenCalled()

    const datosEnviados = axiosMock.post.mock.calls[0][1]

    expect(datosEnviados).toBeDefined()
    expect(resultado).toEqual(usuarioCreado)
  })

  it("actualiza un usuario existente", async () => {
    const usuarioActualizado = {
      id: 1,
      nombre: "Felipe Actualizado",
      email: "felipe@test.cl",
      rol: "ADMIN",
    }

    axiosMock.put.mockResolvedValueOnce({ data: usuarioActualizado })
    axiosMock.patch.mockResolvedValueOnce({ data: usuarioActualizado })

    const actualizarUsuario = obtenerFuncion(usuariosService, [
      "actualizarUsuario",
      "editarUsuario",
      "modificarUsuario",
      "updateUsuario",
    ])

    const resultado = await actualizarUsuario(1, usuarioActualizado)

    expect(
      axiosMock.put.mock.calls.length + axiosMock.patch.mock.calls.length
    ).toBeGreaterThan(0)

    expect(resultado).toEqual(usuarioActualizado)
  })
})
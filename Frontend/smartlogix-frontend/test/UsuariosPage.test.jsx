// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import Usuarios from "../src/pages/Usuarios.jsx";

const { listarUsuariosMock, crearUsuarioMock } = vi.hoisted(() => ({
  listarUsuariosMock: vi.fn(),
  crearUsuarioMock: vi.fn(),
}));

vi.mock("../src/services/usuariosService.js", () => ({
  listarUsuarios: listarUsuariosMock,
  crearUsuario: crearUsuarioMock,
}));

describe("Usuarios page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(window, "alert").mockImplementation(() => {});

    listarUsuariosMock.mockResolvedValue([
      {
        id: 1,
        username: "admin",
        email: "admin@smartlogix.cl",
        rol: "ADMIN",
      },
      {
        id: 2,
        username: "cliente",
        email: "cliente@smartlogix.cl",
        rol: "CLIENTE",
      },
    ]);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("muestra usuarios cargados desde el backend", async () => {
    render(<Usuarios />);

    expect(screen.getByText("Usuarios")).toBeInTheDocument();
    expect(screen.getByText(/gestión de usuarios/i)).toBeInTheDocument();

    expect(await screen.findByText("admin")).toBeInTheDocument();
    expect(screen.getByText("cliente@smartlogix.cl")).toBeInTheDocument();

    expect(listarUsuariosMock).toHaveBeenCalledTimes(1);
  });

  it("permite buscar usuarios por texto", async () => {
    render(<Usuarios />);

    expect(await screen.findByText("admin")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/buscar por id/i), {
      target: { value: "cliente" },
    });

    expect(screen.getByText("cliente")).toBeInTheDocument();
    expect(screen.queryByText("admin")).not.toBeInTheDocument();
  });

  it("crea un usuario con datos válidos", async () => {
    crearUsuarioMock.mockResolvedValue({
      id: 3,
      username: "operador",
      email: "operador@smartlogix.cl",
      rol: "OPERADOR",
    });

    render(<Usuarios />);

    await screen.findByText("admin");

    fireEvent.change(screen.getByPlaceholderText(/nombre de usuario/i), {
      target: { value: "operador" },
    });

    fireEvent.change(screen.getByPlaceholderText(/correo electrónico/i), {
      target: { value: "operador@smartlogix.cl" },
    });

    fireEvent.change(screen.getByPlaceholderText(/contraseña/i), {
      target: { value: "123456" },
    });

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "OPERADOR" },
    });

    fireEvent.click(screen.getByRole("button", { name: /nuevo usuario/i }));

    await waitFor(() => {
      expect(crearUsuarioMock).toHaveBeenCalledWith({
        username: "operador",
        email: "operador@smartlogix.cl",
        password: "123456",
        rol: "OPERADOR",
      });
    });
  });

  it("no crea usuario si faltan campos obligatorios", async () => {
    render(<Usuarios />);

    await screen.findByText("admin");

    fireEvent.click(screen.getByRole("button", { name: /nuevo usuario/i }));

    expect(crearUsuarioMock).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });
});
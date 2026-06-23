// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import Inventario from "../src/pages/Inventario.jsx";

const { obtenerProductosMock, crearProductoMock } = vi.hoisted(() => ({
  obtenerProductosMock: vi.fn(),
  crearProductoMock: vi.fn(),
}));

vi.mock("../src/services/inventarioService.js", () => ({
  obtenerProductos: obtenerProductosMock,
  crearProducto: crearProductoMock,
}));

describe("Inventario page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(window, "alert").mockImplementation(() => {});

    obtenerProductosMock.mockResolvedValue([
      {
        id: 1,
        codigo: "PROD-001",
        nombre: "Teclado Gamer",
        descripcion: "Teclado mecánico RGB",
        precio: 49990,
        stock: 10,
      },
      {
        id: 2,
        codigo: "PROD-002",
        nombre: "Mouse Gamer",
        descripcion: "Mouse óptico",
        precio: 19990,
        stock: 0,
      },
    ]);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("muestra productos cargados desde el backend", async () => {
    render(<Inventario />);

    expect(screen.getByText("Inventario")).toBeInTheDocument();
    expect(screen.getByText(/gestión de productos/i)).toBeInTheDocument();

    expect(await screen.findByText("Teclado Gamer")).toBeInTheDocument();
    expect(screen.getByText("Mouse Gamer")).toBeInTheDocument();
    expect(screen.getByText("PROD-001")).toBeInTheDocument();

    expect(obtenerProductosMock).toHaveBeenCalledTimes(1);
  });

  it("permite buscar productos por nombre, código o descripción", async () => {
    render(<Inventario />);

    expect(await screen.findByText("Teclado Gamer")).toBeInTheDocument();

    fireEvent.change(
      screen.getByPlaceholderText(/buscar por código, nombre o descripción/i),
      {
        target: { value: "mouse" },
      }
    );

    expect(screen.getByText("Mouse Gamer")).toBeInTheDocument();
    expect(screen.queryByText("Teclado Gamer")).not.toBeInTheDocument();
  });

  it("crea un producto con datos válidos", async () => {
    crearProductoMock.mockResolvedValue({
      id: 3,
      codigo: "PROD-003",
      nombre: "Monitor",
      descripcion: "Monitor 24 pulgadas",
      precio: 89990,
      stock: 15,
    });

    render(<Inventario />);

    await screen.findByText("Teclado Gamer");

    fireEvent.change(screen.getByPlaceholderText("Código"), {
      target: { value: "PROD-003" },
    });

    fireEvent.change(screen.getByPlaceholderText("Nombre"), {
      target: { value: "Monitor" },
    });

    fireEvent.change(screen.getByPlaceholderText("Descripción"), {
      target: { value: "Monitor 24 pulgadas" },
    });

    fireEvent.change(screen.getByPlaceholderText("Precio"), {
      target: { value: "89990" },
    });

    fireEvent.change(screen.getByPlaceholderText("Stock"), {
      target: { value: "15" },
    });

    fireEvent.click(screen.getByRole("button", { name: /nuevo producto/i }));

    await waitFor(() => {
      expect(crearProductoMock).toHaveBeenCalledWith({
        codigo: "PROD-003",
        nombre: "Monitor",
        descripcion: "Monitor 24 pulgadas",
        precio: 89990,
        stock: 15,
      });
    });
  });

  it("no crea producto si faltan campos obligatorios", async () => {
    render(<Inventario />);

    await screen.findByText("Teclado Gamer");

    fireEvent.click(screen.getByRole("button", { name: /nuevo producto/i }));

    expect(crearProductoMock).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });

  it("no permite crear producto con código duplicado", async () => {
    render(<Inventario />);

    await screen.findByText("Teclado Gamer");

    fireEvent.change(screen.getByPlaceholderText("Código"), {
      target: { value: "PROD-001" },
    });

    fireEvent.change(screen.getByPlaceholderText("Nombre"), {
      target: { value: "Producto duplicado" },
    });

    fireEvent.change(screen.getByPlaceholderText("Precio"), {
      target: { value: "10000" },
    });

    fireEvent.change(screen.getByPlaceholderText("Stock"), {
      target: { value: "5" },
    });

    fireEvent.click(screen.getByRole("button", { name: /nuevo producto/i }));

    expect(crearProductoMock).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith("Código ya usado, ingrese otro.");
  });
});
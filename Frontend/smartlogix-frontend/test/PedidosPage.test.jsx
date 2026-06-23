// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import Pedidos from "../src/pages/Pedidos.jsx";

const {
  obtenerPedidosMock,
  crearPedidoMock,
  aprobarPedidoMock,
  rechazarPedidoMock,
} = vi.hoisted(() => ({
  obtenerPedidosMock: vi.fn(),
  crearPedidoMock: vi.fn(),
  aprobarPedidoMock: vi.fn(),
  rechazarPedidoMock: vi.fn(),
}));

vi.mock("../src/services/pedidosService.js", () => ({
  obtenerPedidos: obtenerPedidosMock,
  crearPedido: crearPedidoMock,
  aprobarPedido: aprobarPedidoMock,
  rechazarPedido: rechazarPedidoMock,
}));

describe("Pedidos page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.spyOn(window, "confirm").mockImplementation(() => true);

    obtenerPedidosMock.mockResolvedValue([
      {
        id: 1,
        cliente: "Cliente Norte",
        estado: "CREADO",
      },
      {
        id: 2,
        cliente: "Cliente Sur",
        estado: "APROBADO",
      },
    ]);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("muestra pedidos cargados desde el backend", async () => {
    render(<Pedidos />);

    expect(screen.getByText("Pedidos")).toBeInTheDocument();
    expect(screen.getByText(/creación, validación y seguimiento/i)).toBeInTheDocument();

    expect(await screen.findByText("Cliente Norte")).toBeInTheDocument();
    expect(screen.getByText("Cliente Sur")).toBeInTheDocument();
    expect(screen.getByText("CREADO")).toBeInTheDocument();
    expect(screen.getByText("APROBADO")).toBeInTheDocument();

    expect(obtenerPedidosMock).toHaveBeenCalledTimes(1);
  });

  it("permite buscar pedidos por cliente, ID o estado", async () => {
    render(<Pedidos />);

    expect(await screen.findByText("Cliente Norte")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/buscar por cliente/i), {
      target: { value: "sur" },
    });

    expect(screen.getByText("Cliente Sur")).toBeInTheDocument();
    expect(screen.queryByText("Cliente Norte")).not.toBeInTheDocument();
  });

  it("crea un pedido con datos válidos", async () => {
    crearPedidoMock.mockResolvedValue({
      id: 3,
      cliente: "Cliente Nuevo",
      estado: "CREADO",
    });

    render(<Pedidos />);

    await screen.findByText("Cliente Norte");

    fireEvent.change(screen.getByPlaceholderText("Cliente *"), {
  target: { value: "Cliente Nuevo" },
    });

    fireEvent.change(screen.getByPlaceholderText(/id producto/i), {
      target: { value: "5" },
    });

    fireEvent.change(screen.getByPlaceholderText(/cantidad/i), {
      target: { value: "2" },
    });

    fireEvent.click(screen.getByRole("button", { name: /nuevo pedido/i }));

    await waitFor(() => {
      expect(crearPedidoMock).toHaveBeenCalledWith({
        cliente: "Cliente Nuevo",
        items: [
          {
            productoId: 5,
            cantidad: 2,
          },
        ],
      });
    });
  });

  it("no crea pedido si falta el nombre del cliente", async () => {
    render(<Pedidos />);

    await screen.findByText("Cliente Norte");

    fireEvent.change(screen.getByPlaceholderText(/id producto/i), {
      target: { value: "5" },
    });

    fireEvent.change(screen.getByPlaceholderText(/cantidad/i), {
      target: { value: "2" },
    });

    fireEvent.click(screen.getByRole("button", { name: /nuevo pedido/i }));

    expect(crearPedidoMock).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith("El nombre del cliente es obligatorio.");
  });

  it("aprueba un pedido pendiente", async () => {
    aprobarPedidoMock.mockResolvedValue({
      id: 1,
      cliente: "Cliente Norte",
      estado: "APROBADO",
    });

    render(<Pedidos />);

    await screen.findByText("Cliente Norte");

    fireEvent.click(screen.getByRole("button", { name: /aprobar/i }));

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(aprobarPedidoMock).toHaveBeenCalledWith(1);
    });
  });

  it("rechaza un pedido pendiente", async () => {
    rechazarPedidoMock.mockResolvedValue({
      id: 1,
      cliente: "Cliente Norte",
      estado: "RECHAZADO",
    });

    render(<Pedidos />);

    await screen.findByText("Cliente Norte");

    fireEvent.click(screen.getByRole("button", { name: /rechazar/i }));

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(rechazarPedidoMock).toHaveBeenCalledWith(1);
    });
  });
});
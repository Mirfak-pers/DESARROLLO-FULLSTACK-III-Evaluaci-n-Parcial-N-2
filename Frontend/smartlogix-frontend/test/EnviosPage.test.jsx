// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import Envios from "../src/pages/Envios.jsx";

const {
  obtenerEnviosMock,
  crearEnvioMock,
  actualizarEstadoEnvioMock,
} = vi.hoisted(() => ({
  obtenerEnviosMock: vi.fn(),
  crearEnvioMock: vi.fn(),
  actualizarEstadoEnvioMock: vi.fn(),
}));

vi.mock("../src/services/enviosService.js", () => ({
  obtenerEnvios: obtenerEnviosMock,
  crearEnvio: crearEnvioMock,
  actualizarEstadoEnvio: actualizarEstadoEnvioMock,
}));

describe("Envios page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.spyOn(window, "confirm").mockImplementation(() => true);

    obtenerEnviosMock.mockResolvedValue([
      {
        id: 1,
        pedidoId: 10,
        usuarioId: 5,
        numeroSeguimiento: "ENV-001",
        direccionDestino: "Av. Siempre Viva 123",
        ciudadDestino: "Santiago",
        regionDestino: "Metropolitana",
        transportista: "Chilexpress",
        estado: "PENDIENTE",
        fechaEntregaEstimada: "2026-06-25T12:00:00",
      },
      {
        id: 2,
        pedidoId: 11,
        usuarioId: 6,
        numeroSeguimiento: "ENV-002",
        direccionDestino: "Los Leones 456",
        ciudadDestino: "Providencia",
        regionDestino: "Metropolitana",
        transportista: "Starken",
        estado: "ENTREGADO",
        fechaEntregaEstimada: "2026-06-26T12:00:00",
      },
    ]);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("muestra envíos cargados desde el backend", async () => {
    render(<Envios />);

    expect(screen.getByText("Envíos")).toBeInTheDocument();
    expect(screen.getByText(/gestión, seguimiento/i)).toBeInTheDocument();

    expect(await screen.findByText("ENV-001")).toBeInTheDocument();
    expect(screen.getByText("ENV-002")).toBeInTheDocument();
    expect(screen.getByText("Chilexpress")).toBeInTheDocument();
    expect(screen.getByText("Starken")).toBeInTheDocument();

    expect(obtenerEnviosMock).toHaveBeenCalledTimes(1);
  });

  it("permite buscar envíos por ciudad, estado o seguimiento", async () => {
    render(<Envios />);

    expect(await screen.findByText("ENV-001")).toBeInTheDocument();

    fireEvent.change(
      screen.getByPlaceholderText(/buscar por id, pedido, usuario/i),
      {
        target: { value: "providencia" },
      }
    );

    expect(screen.getByText("ENV-002")).toBeInTheDocument();
    expect(screen.queryByText("ENV-001")).not.toBeInTheDocument();
  });

  it("crea un envío con datos válidos", async () => {
    crearEnvioMock.mockResolvedValue({
      id: 3,
      pedidoId: 20,
      usuarioId: 8,
      numeroSeguimiento: "ENV-003",
      direccionDestino: "Av. Prueba 999",
      ciudadDestino: "Maipú",
      regionDestino: "Metropolitana",
      transportista: "Blue Express",
      estado: "PENDIENTE",
      fechaEntregaEstimada: "2026-06-30T10:00:00",
    });

    render(<Envios />);

    await screen.findByText("ENV-001");

    fireEvent.change(screen.getByPlaceholderText("ID Pedido *"), {
      target: { value: "20" },
    });

    fireEvent.change(screen.getByPlaceholderText("ID Usuario *"), {
      target: { value: "8" },
    });

    fireEvent.change(screen.getByPlaceholderText("Dirección destino *"), {
      target: { value: "Av. Prueba 999" },
    });

    fireEvent.change(screen.getByPlaceholderText("Ciudad destino *"), {
      target: { value: "Maipú" },
    });

    fireEvent.change(screen.getByPlaceholderText("Región destino *"), {
      target: { value: "Metropolitana" },
    });

    fireEvent.change(screen.getByPlaceholderText("Transportista"), {
      target: { value: "Blue Express" },
    });

    fireEvent.click(screen.getByRole("button", { name: /nuevo envío/i }));

    await waitFor(() => {
      expect(crearEnvioMock).toHaveBeenCalledWith({
        pedidoId: 20,
        usuarioId: 8,
        direccionDestino: "Av. Prueba 999",
        ciudadDestino: "Maipú",
        regionDestino: "Metropolitana",
        transportista: "Blue Express",
        fechaEntregaEstimada: null,
      });
    });
  });

  it("no crea envío si faltan campos obligatorios", async () => {
    render(<Envios />);

    await screen.findByText("ENV-001");

    fireEvent.click(screen.getByRole("button", { name: /nuevo envío/i }));

    expect(crearEnvioMock).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });

  it("cambia el estado de un envío a entregado", async () => {
    actualizarEstadoEnvioMock.mockResolvedValue({
      id: 1,
      pedidoId: 10,
      usuarioId: 5,
      estado: "ENTREGADO",
    });

    render(<Envios />);

    await screen.findByText("ENV-001");

    fireEvent.click(screen.getByRole("button", { name: /marcar entregado/i }));

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(actualizarEstadoEnvioMock).toHaveBeenCalledWith(1, "ENTREGADO");
    });
  });
});
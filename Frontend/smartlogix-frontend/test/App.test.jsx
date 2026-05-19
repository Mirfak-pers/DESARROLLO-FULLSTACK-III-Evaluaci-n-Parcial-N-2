// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import App from "../src/App.jsx"

afterEach(() => {
  cleanup()
})

describe("Frontend SmartLogix", () => {
  it("renderiza la aplicación sin errores", () => {
    const { container } = render(<App />)

    expect(container).toBeInTheDocument()
  })

  it("muestra el nombre SmartLogix en pantalla", () => {
    render(<App />)

    const textosSmartLogix = screen.getAllByText(/smartlogix/i)

    expect(textosSmartLogix.length).toBeGreaterThan(0)
  })

  it("muestra los módulos principales del sistema", () => {
    render(<App />)

    expect(screen.getAllByText(/inventario/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/pedidos/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/envíos|envios/i).length).toBeGreaterThan(0)
  })
})
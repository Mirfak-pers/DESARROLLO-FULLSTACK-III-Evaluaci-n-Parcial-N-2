import { test, expect } from "@playwright/test";

const jsonResponse = (data, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(data),
});

test.beforeEach(async ({ page }) => {
  let productos = [
    {
      id: 1,
      codigo: "PROD-001",
      nombre: "Teclado mecánico",
      descripcion: "Periférico gamer",
      precio: 29990,
      stock: 10,
    },
  ];

  await page.route("**/api/bff/inventario/productos", async (route) => {
    const request = route.request();

    if (request.method() === "GET") {
      return route.fulfill(jsonResponse(productos));
    }

    if (request.method() === "POST") {
      const body = request.postDataJSON();

      const nuevoProducto = {
        id: 2,
        codigo: body.codigo || "PROD-E2E",
        nombre: body.nombre || "Mouse E2E",
        descripcion: body.descripcion || "Producto creado desde prueba E2E",
        precio: Number(body.precio || 15990),
        stock: Number(body.stock || 5),
      };

      productos = [...productos, nuevoProducto];

      return route.fulfill(jsonResponse(nuevoProducto, 201));
    }

    return route.continue();
  });

  await page.route("**/api/bff/pedidos", async (route) => {
    const pedidos = [
      {
        id: 1,
        cliente: "Cliente Demo",
        estado: "CREADO",
        total: 29990,
        fechaPedido: "2026-06-23",
      },
    ];

    return route.fulfill(jsonResponse(pedidos));
  });

  await page.route("**/api/bff/envios", async (route) => {
    const envios = [
      {
        id: 1,
        pedidoId: 1,
        usuarioId: 1,
        numeroSeguimiento: "SLX-001",
        direccionDestino: "Av. Siempre Viva 123",
        ciudadDestino: "Santiago",
        regionDestino: "Metropolitana",
        transportista: "Blue Express",
        estado: "PENDIENTE",
        fechaEntregaEstimada: null,
      },
    ];

    return route.fulfill(jsonResponse(envios));
  });

  await page.route("**/api/bff/usuarios", async (route) => {
    const usuarios = [
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
    ];

    return route.fulfill(jsonResponse(usuarios));
  });

  await page.addInitScript(() => {
    localStorage.setItem("kc_token", "token-e2e");
  });
});

test("flujo e2e: navegar por los módulos principales", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("body")).toContainText(/SmartLogix/i);

  await page.locator('a[href="/inventario"]').first().click();
  await expect(page).toHaveURL(/inventario/i);
  await expect(page.locator("body")).toContainText("Teclado mecánico");

  await page.locator('a[href="/pedidos"]').first().click();
  await expect(page).toHaveURL(/pedidos/i);
  await expect(page.locator("body")).toContainText("Cliente Demo");

  await page.locator('a[href="/envios"]').first().click();
  await expect(page).toHaveURL(/envios/i);
  await expect(page.locator("body")).toContainText("Blue Express");

  await page.locator('a[href="/usuarios"]').first().click();
  await expect(page).toHaveURL(/usuarios/i);
  await expect(page.locator("body")).toContainText("admin@smartlogix.cl");
});

test("flujo e2e crítico: crear producto desde inventario", async ({ page }) => {
  await page.goto("/inventario");

  await expect(page.locator("body")).toContainText("Teclado mecánico");

  await page.locator('input[name="codigo"]').fill("PROD-E2E");
  await page.locator('input[name="nombre"]').fill("Mouse E2E");
  await page.locator('input[name="descripcion"]').fill("Producto creado desde prueba E2E");
  await page.locator('input[name="precio"]').fill("15990");
  await page.locator('input[name="stock"]').fill("5");

  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });

  await page.getByRole("button", { name: /Nuevo producto|Guardar|Crear/i }).click();

  await expect(page.locator("body")).toContainText("Mouse E2E");
  await expect(page.locator("body")).toContainText("PROD-E2E");
});
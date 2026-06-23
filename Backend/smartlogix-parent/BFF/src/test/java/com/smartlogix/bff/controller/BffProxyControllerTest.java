package com.smartlogix.bff.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BffProxyControllerTest {

    @Mock
    private RestTemplate restTemplate;

    private BffProxyController controller;

    @BeforeEach
    void setUp() {
        controller = new BffProxyController(restTemplate);

        ReflectionTestUtils.setField(
                controller,
                "inventarioUrl",
                "http://localhost:8081/api/inventario/productos"
        );

        ReflectionTestUtils.setField(
                controller,
                "pedidosUrl",
                "http://localhost:8082/api/pedidos"
        );

        ReflectionTestUtils.setField(
                controller,
                "enviosUrl",
                "http://localhost:8083/api/envios"
        );

        ReflectionTestUtils.setField(
                controller,
                "usuariosUrl",
                "http://localhost:8084/api/usuarios"
        );
    }

    @Test
    void health_deberiaRetornarEstadoDelBff() {
        ResponseEntity<Map<String, String>> respuesta = controller.health();

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertNotNull(respuesta.getBody());
        assertEquals("BFF SmartLogix", respuesta.getBody().get("servicio"));
        assertEquals("funcionando", respuesta.getBody().get("estado"));
        assertEquals("8090", respuesta.getBody().get("puerto"));
    }

    @Test
    void listarProductos_deberiaConsultarMicroservicioInventario() {
        List<Map<String, Object>> productos = List.of(
                Map.of("id", 1, "nombre", "Teclado", "stock", 10)
        );

        when(restTemplate.getForEntity(
                "http://localhost:8081/api/inventario/productos",
                Object.class
        )).thenReturn(ResponseEntity.ok(productos));

        ResponseEntity<Object> respuesta = controller.listarProductos();

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertEquals(productos, respuesta.getBody());

        verify(restTemplate).getForEntity(
                "http://localhost:8081/api/inventario/productos",
                Object.class
        );
    }

    @Test
    void buscarProductoPorId_deberiaConsultarProductoPorId() {
        Map<String, Object> producto = Map.of(
                "id", 1,
                "nombre", "Teclado",
                "stock", 10
        );

        when(restTemplate.getForEntity(
                "http://localhost:8081/api/inventario/productos/1",
                Object.class
        )).thenReturn(ResponseEntity.ok(producto));

        ResponseEntity<Object> respuesta = controller.buscarProductoPorId(1L);

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertEquals(producto, respuesta.getBody());
    }

    @Test
    void crearProducto_deberiaEnviarProductoAInventario() {
        Map<String, Object> body = Map.of(
                "codigo", "PROD-001",
                "nombre", "Teclado",
                "stock", 10
        );

        Map<String, Object> productoCreado = Map.of(
                "id", 1,
                "codigo", "PROD-001",
                "nombre", "Teclado",
                "stock", 10
        );

        when(restTemplate.postForEntity(
                "http://localhost:8081/api/inventario/productos",
                body,
                Object.class
        )).thenReturn(ResponseEntity.status(HttpStatus.CREATED).body(productoCreado));

        ResponseEntity<Object> respuesta = controller.crearProducto(body);

        assertEquals(HttpStatus.CREATED, respuesta.getStatusCode());
        assertEquals(productoCreado, respuesta.getBody());
    }

    @Test
    void listarPedidos_deberiaConsultarMicroservicioPedidos() {
        List<Map<String, Object>> pedidos = List.of(
                Map.of("id", 1, "cliente", "Cliente Norte", "estado", "CREADO")
        );

        when(restTemplate.getForEntity(
                "http://localhost:8082/api/pedidos",
                Object.class
        )).thenReturn(ResponseEntity.ok(pedidos));

        ResponseEntity<Object> respuesta = controller.listarPedidos();

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertEquals(pedidos, respuesta.getBody());
    }

    @Test
    void crearPedido_deberiaEnviarPedidoAMicroservicioPedidos() {
        Map<String, Object> body = Map.of(
                "cliente", "Cliente Nuevo",
                "detalles", List.of(Map.of("productoId", 1, "cantidad", 2))
        );

        Map<String, Object> pedidoCreado = Map.of(
                "id", 1,
                "cliente", "Cliente Nuevo",
                "estado", "CREADO"
        );

        when(restTemplate.postForEntity(
                "http://localhost:8082/api/pedidos",
                body,
                Object.class
        )).thenReturn(ResponseEntity.status(HttpStatus.CREATED).body(pedidoCreado));

        ResponseEntity<Object> respuesta = controller.crearPedido(body);

        assertEquals(HttpStatus.CREATED, respuesta.getStatusCode());
        assertEquals(pedidoCreado, respuesta.getBody());
    }

    @Test
    void cambiarEstadoPedido_deberiaUsarPatchContraPedidos() {
        Map<String, Object> body = Map.of("estado", "APROBADO");
        Map<String, Object> pedidoActualizado = Map.of("id", 1, "estado", "APROBADO");

        when(restTemplate.exchange(
                eq("http://localhost:8082/api/pedidos/1/estado"),
                eq(HttpMethod.PATCH),
                any(),
                eq(Object.class)
        )).thenReturn(ResponseEntity.ok(pedidoActualizado));

        ResponseEntity<Object> respuesta = controller.cambiarEstadoPedido(1L, body);

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertEquals(pedidoActualizado, respuesta.getBody());
    }

    @Test
    void listarEnvios_deberiaConsultarMicroservicioEnvios() {
        List<Map<String, Object>> envios = List.of(
                Map.of("id", 1, "estado", "PENDIENTE", "ciudadDestino", "Santiago")
        );

        when(restTemplate.getForEntity(
                "http://localhost:8083/api/envios",
                Object.class
        )).thenReturn(ResponseEntity.ok(envios));

        ResponseEntity<Object> respuesta = controller.listarEnvios();

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertEquals(envios, respuesta.getBody());
    }

    @Test
    void crearEnvio_deberiaEnviarEnvioAMicroservicioEnvios() {
        Map<String, Object> body = Map.of(
                "pedidoId", 1,
                "usuarioId", 1,
                "direccionDestino", "Av. Prueba 123"
        );

        Map<String, Object> envioCreado = Map.of(
                "id", 1,
                "estado", "PENDIENTE"
        );

        when(restTemplate.postForEntity(
                "http://localhost:8083/api/envios",
                body,
                Object.class
        )).thenReturn(ResponseEntity.status(HttpStatus.CREATED).body(envioCreado));

        ResponseEntity<Object> respuesta = controller.crearEnvio(body);

        assertEquals(HttpStatus.CREATED, respuesta.getStatusCode());
        assertEquals(envioCreado, respuesta.getBody());
    }

    @Test
    void actualizarEstadoEnvio_deberiaUsarPatchContraEnvios() {
        Map<String, Object> body = Map.of("nuevoEstado", "ENTREGADO");
        Map<String, Object> envioActualizado = Map.of("id", 1, "estado", "ENTREGADO");

        when(restTemplate.exchange(
                eq("http://localhost:8083/api/envios/1/estado"),
                eq(HttpMethod.PATCH),
                any(),
                eq(Object.class)
        )).thenReturn(ResponseEntity.ok(envioActualizado));

        ResponseEntity<Object> respuesta = controller.actualizarEstadoEnvio(1L, body);

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertEquals(envioActualizado, respuesta.getBody());
    }

    @Test
    void listarUsuarios_deberiaConsultarMicroservicioUsuarios() {
        List<Map<String, Object>> usuarios = List.of(
                Map.of("id", 1, "username", "admin", "rol", "ADMIN")
        );

        when(restTemplate.getForEntity(
                "http://localhost:8084/api/usuarios",
                Object.class
        )).thenReturn(ResponseEntity.ok(usuarios));

        ResponseEntity<Object> respuesta = controller.listarUsuarios();

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertEquals(usuarios, respuesta.getBody());
    }

    @Test
    void registrarUsuario_deberiaEnviarUsuarioAMicroservicioUsuarios() {
        Map<String, Object> body = Map.of(
                "username", "cliente",
                "email", "cliente@smartlogix.cl",
                "password", "123456",
                "rol", "CLIENTE"
        );

        Map<String, Object> usuarioCreado = Map.of(
                "id", 1,
                "username", "cliente",
                "rol", "CLIENTE"
        );

        when(restTemplate.postForEntity(
                "http://localhost:8084/api/usuarios/registro",
                body,
                Object.class
        )).thenReturn(ResponseEntity.status(HttpStatus.CREATED).body(usuarioCreado));

        ResponseEntity<Object> respuesta = controller.registrarUsuario(body);

        assertEquals(HttpStatus.CREATED, respuesta.getStatusCode());
        assertEquals(usuarioCreado, respuesta.getBody());
    }

    @Test
    void actualizarUsuario_deberiaUsarPutContraUsuarios() {
        Map<String, Object> body = Map.of(
                "username", "admin",
                "email", "admin@smartlogix.cl",
                "rol", "ADMIN"
        );

        Map<String, Object> usuarioActualizado = Map.of(
                "id", 1,
                "username", "admin"
        );

        when(restTemplate.exchange(
                eq("http://localhost:8084/api/usuarios/1"),
                eq(HttpMethod.PUT),
                any(),
                eq(Object.class)
        )).thenReturn(ResponseEntity.ok(usuarioActualizado));

        ResponseEntity<Object> respuesta = controller.actualizarUsuario(1L, body);

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertEquals(usuarioActualizado, respuesta.getBody());
    }

    @Test
    void eliminarUsuario_deberiaUsarDeleteContraUsuarios() {
        when(restTemplate.exchange(
                eq("http://localhost:8084/api/usuarios/1"),
                eq(HttpMethod.DELETE),
                any(),
                eq(Object.class)
        )).thenReturn(ResponseEntity.noContent().build());

        ResponseEntity<Object> respuesta = controller.eliminarUsuario(1L);

        assertEquals(HttpStatus.NO_CONTENT, respuesta.getStatusCode());
    }

    @Test
    void listarProductos_deberiaRetornarErrorDelMicroservicioCuandoFalla() {
        HttpClientErrorException exception = HttpClientErrorException.create(
                HttpStatus.NOT_FOUND,
                "No encontrado",
                null,
                "Producto no encontrado".getBytes(StandardCharsets.UTF_8),
                StandardCharsets.UTF_8
        );

        when(restTemplate.getForEntity(
                "http://localhost:8081/api/inventario/productos",
                Object.class
        )).thenThrow(exception);

        ResponseEntity<Object> respuesta = controller.listarProductos();

        assertEquals(HttpStatus.NOT_FOUND, respuesta.getStatusCode());
        assertEquals("Producto no encontrado", respuesta.getBody());
    }

    @Test
    void listarUsuarios_deberiaRetornarErrorInternoCuandoRestTemplateFalla() {
        when(restTemplate.getForEntity(
                "http://localhost:8084/api/usuarios",
                Object.class
        )).thenThrow(new RuntimeException("Servicio no disponible"));

        ResponseEntity<Object> respuesta = controller.listarUsuarios();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, respuesta.getStatusCode());
        assertNotNull(respuesta.getBody());
    }

        @Test
    void actualizarStock_deberiaUsarPatchContraInventario() {
        Map<String, Object> body = Map.of("cantidad", 20);
        Map<String, Object> productoActualizado = Map.of("id", 1, "stock", 20);

        when(restTemplate.exchange(
                eq("http://localhost:8081/api/inventario/productos/1/stock"),
                eq(HttpMethod.PATCH),
                any(),
                eq(Object.class)
        )).thenReturn(ResponseEntity.ok(productoActualizado));

        ResponseEntity<Object> respuesta = controller.actualizarStock(1L, body);

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertEquals(productoActualizado, respuesta.getBody());
    }

    @Test
    void descontarStock_deberiaUsarPatchContraInventario() {
        Map<String, Object> body = Map.of("cantidad", 2);
        Map<String, Object> productoActualizado = Map.of("id", 1, "stock", 8);

        when(restTemplate.exchange(
                eq("http://localhost:8081/api/inventario/productos/1/descontar"),
                eq(HttpMethod.PATCH),
                any(),
                eq(Object.class)
        )).thenReturn(ResponseEntity.ok(productoActualizado));

        ResponseEntity<Object> respuesta = controller.descontarStock(1L, body);

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertEquals(productoActualizado, respuesta.getBody());
    }

    @Test
    void reponerStock_deberiaUsarPatchContraInventario() {
        Map<String, Object> body = Map.of("cantidad", 5);
        Map<String, Object> productoActualizado = Map.of("id", 1, "stock", 15);

        when(restTemplate.exchange(
                eq("http://localhost:8081/api/inventario/productos/1/reponer"),
                eq(HttpMethod.PATCH),
                any(),
                eq(Object.class)
        )).thenReturn(ResponseEntity.ok(productoActualizado));

        ResponseEntity<Object> respuesta = controller.reponerStock(1L, body);

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertEquals(productoActualizado, respuesta.getBody());
    }

    @Test
    void obtenerMovimientos_deberiaConsultarInventario() {
        List<Map<String, Object>> movimientos = List.of(
                Map.of("id", 1, "codigoProducto", "PROD-001", "cantidad", 10)
        );

        when(restTemplate.getForEntity(
                "http://localhost:8081/api/inventario/productos/1/movimientos",
                Object.class
        )).thenReturn(ResponseEntity.ok(movimientos));

        ResponseEntity<Object> respuesta = controller.obtenerMovimientos(1L);

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertEquals(movimientos, respuesta.getBody());
    }

    @Test
    void buscarPedidoPorId_deberiaConsultarPedidos() {
        Map<String, Object> pedido = Map.of(
                "id", 1,
                "cliente", "Cliente Norte",
                "estado", "CREADO"
        );

        when(restTemplate.getForEntity(
                "http://localhost:8082/api/pedidos/1",
                Object.class
        )).thenReturn(ResponseEntity.ok(pedido));

        ResponseEntity<Object> respuesta = controller.buscarPedidoPorId(1L);

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertEquals(pedido, respuesta.getBody());
    }

    @Test
    void obtenerDetallePedido_deberiaConsultarPedidos() {
        List<Map<String, Object>> detalles = List.of(
                Map.of("productoId", 1, "cantidad", 2)
        );

        when(restTemplate.getForEntity(
                "http://localhost:8082/api/pedidos/1/detalles",
                Object.class
        )).thenReturn(ResponseEntity.ok(detalles));

        ResponseEntity<Object> respuesta = controller.obtenerDetallePedido(1L);

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertEquals(detalles, respuesta.getBody());
    }

    @Test
    void buscarEnvioPorId_deberiaConsultarEnvios() {
        Map<String, Object> envio = Map.of(
                "id", 1,
                "estado", "PENDIENTE",
                "ciudadDestino", "Santiago"
        );

        when(restTemplate.getForEntity(
                "http://localhost:8083/api/envios/1",
                Object.class
        )).thenReturn(ResponseEntity.ok(envio));

        ResponseEntity<Object> respuesta = controller.buscarEnvioPorId(1L);

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertEquals(envio, respuesta.getBody());
    }

    @Test
    void eliminarEnvio_deberiaUsarDeleteContraEnvios() {
        when(restTemplate.exchange(
                eq("http://localhost:8083/api/envios/1"),
                eq(HttpMethod.DELETE),
                any(),
                eq(Object.class)
        )).thenReturn(ResponseEntity.noContent().build());

        ResponseEntity<Object> respuesta = controller.eliminarEnvio(1L);

        assertEquals(HttpStatus.NO_CONTENT, respuesta.getStatusCode());
    }

    @Test
    void buscarUsuarioPorId_deberiaConsultarUsuarios() {
        Map<String, Object> usuario = Map.of(
                "id", 1,
                "username", "admin",
                "rol", "ADMIN"
        );

        when(restTemplate.getForEntity(
                "http://localhost:8084/api/usuarios/1",
                Object.class
        )).thenReturn(ResponseEntity.ok(usuario));

        ResponseEntity<Object> respuesta = controller.buscarUsuarioPorId(1L);

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertEquals(usuario, respuesta.getBody());
    }

    @Test
    void loginUsuario_deberiaEnviarCredencialesAUsuarios() {
        Map<String, Object> body = Map.of(
                "username", "admin",
                "password", "123456"
        );

        Map<String, Object> usuarioLogin = Map.of(
                "id", 1,
                "username", "admin",
                "rol", "ADMIN"
        );

        when(restTemplate.postForEntity(
                "http://localhost:8084/api/usuarios/login",
                body,
                Object.class
        )).thenReturn(ResponseEntity.ok(usuarioLogin));

        ResponseEntity<Object> respuesta = controller.loginUsuario(body);

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertEquals(usuarioLogin, respuesta.getBody());
    }
}
package com.smartlogix.bff.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Map;

@RestController
@RequestMapping("/api/bff")
@CrossOrigin(origins = "*")
@Tag(name = "BFF SmartLogix", description = "Capa BFF que centraliza la comunicación entre frontend y microservicios")
public class BffProxyController {

    private final RestTemplate restTemplate;

    @Value("${smartlogix.services.inventario.url}")
    private String inventarioUrl;

    @Value("${smartlogix.services.pedidos.url}")
    private String pedidosUrl;

    @Value("${smartlogix.services.envios.url}")
    private String enviosUrl;

    @Value("${smartlogix.services.usuarios.url}")
    private String usuariosUrl;

    public BffProxyController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Operation(summary = "Health check del BFF")
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(
                Map.of(
                        "servicio", "BFF SmartLogix",
                        "estado", "funcionando",
                        "puerto", "8090"
                )
        );
    }

    // =========================
    // INVENTARIO
    // =========================

    @Operation(summary = "Listar productos desde Inventario")
    @GetMapping("/inventario/productos")
    public ResponseEntity<Object> listarProductos() {
        return get(inventarioUrl);
    }

    @Operation(summary = "Buscar producto por ID desde Inventario")
    @GetMapping("/inventario/productos/{id}")
    public ResponseEntity<Object> buscarProductoPorId(@PathVariable Long id) {
        return get(inventarioUrl + "/" + id);
    }

    @Operation(summary = "Crear producto desde Inventario")
    @PostMapping("/inventario/productos")
    public ResponseEntity<Object> crearProducto(@RequestBody Map<String, Object> body) {
        return post(inventarioUrl, body);
    }

    @Operation(summary = "Actualizar stock de producto desde Inventario")
    @PatchMapping("/inventario/productos/{id}/stock")
    public ResponseEntity<Object> actualizarStock(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body
    ) {
        return patch(inventarioUrl + "/" + id + "/stock", body);
    }

    @Operation(summary = "Descontar stock desde Inventario")
    @PatchMapping("/inventario/productos/{id}/descontar")
    public ResponseEntity<Object> descontarStock(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body
    ) {
        return patch(inventarioUrl + "/" + id + "/descontar", body);
    }

    @Operation(summary = "Reponer stock desde Inventario")
    @PatchMapping("/inventario/productos/{id}/reponer")
    public ResponseEntity<Object> reponerStock(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body
    ) {
        return patch(inventarioUrl + "/" + id + "/reponer", body);
    }

    @Operation(summary = "Obtener movimientos de inventario")
    @GetMapping("/inventario/productos/{id}/movimientos")
    public ResponseEntity<Object> obtenerMovimientos(@PathVariable Long id) {
        return get(inventarioUrl + "/" + id + "/movimientos");
    }

    // =========================
    // PEDIDOS
    // =========================

    @Operation(summary = "Listar pedidos")
    @GetMapping("/pedidos")
    public ResponseEntity<Object> listarPedidos() {
        return get(pedidosUrl);
    }

    @Operation(summary = "Buscar pedido por ID")
    @GetMapping("/pedidos/{id}")
    public ResponseEntity<Object> buscarPedidoPorId(@PathVariable Long id) {
        return get(pedidosUrl + "/" + id);
    }

    @Operation(summary = "Crear pedido")
    @PostMapping("/pedidos")
    public ResponseEntity<Object> crearPedido(@RequestBody Map<String, Object> body) {
        return post(pedidosUrl, body);
    }

    @Operation(summary = "Cambiar estado de pedido")
    @PatchMapping("/pedidos/{id}/estado")
    public ResponseEntity<Object> cambiarEstadoPedido(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body
    ) {
        return patch(pedidosUrl + "/" + id + "/estado", body);
    }

    @Operation(summary = "Obtener detalles de pedido")
    @GetMapping("/pedidos/{id}/detalles")
    public ResponseEntity<Object> obtenerDetallePedido(@PathVariable Long id) {
        return get(pedidosUrl + "/" + id + "/detalles");
    }

    // =========================
    // ENVIOS
    // =========================

    @Operation(summary = "Listar envíos")
    @GetMapping("/envios")
    public ResponseEntity<Object> listarEnvios() {
        return get(enviosUrl);
    }

    @Operation(summary = "Buscar envío por ID")
    @GetMapping("/envios/{id}")
    public ResponseEntity<Object> buscarEnvioPorId(@PathVariable Long id) {
        return get(enviosUrl + "/" + id);
    }

    @Operation(summary = "Crear envío")
    @PostMapping("/envios")
    public ResponseEntity<Object> crearEnvio(@RequestBody Map<String, Object> body) {
        return post(enviosUrl, body);
    }

    @Operation(summary = "Actualizar estado de envío")
    @PatchMapping("/envios/{id}/estado")
    public ResponseEntity<Object> actualizarEstadoEnvio(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body
    ) {
        return patch(enviosUrl + "/" + id + "/estado", body);
    }

    @Operation(summary = "Eliminar envío")
    @DeleteMapping("/envios/{id}")
    public ResponseEntity<Object> eliminarEnvio(@PathVariable Long id) {
        return delete(enviosUrl + "/" + id);
    }

    // =========================
    // USUARIOS
    // =========================

    @Operation(summary = "Listar usuarios")
    @GetMapping("/usuarios")
    public ResponseEntity<Object> listarUsuarios() {
        return get(usuariosUrl);
    }

    @Operation(summary = "Buscar usuario por ID")
    @GetMapping("/usuarios/{id}")
    public ResponseEntity<Object> buscarUsuarioPorId(@PathVariable Long id) {
        return get(usuariosUrl + "/" + id);
    }

    @Operation(summary = "Registrar usuario")
    @PostMapping("/usuarios/registro")
    public ResponseEntity<Object> registrarUsuario(@RequestBody Map<String, Object> body) {
        return post(usuariosUrl + "/registro", body);
    }

    @Operation(summary = "Login usuario")
    @PostMapping("/usuarios/login")
    public ResponseEntity<Object> loginUsuario(@RequestBody Map<String, Object> body) {
        return post(usuariosUrl + "/login", body);
    }

    @Operation(summary = "Actualizar usuario")
    @PutMapping("/usuarios/{id}")
    public ResponseEntity<Object> actualizarUsuario(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body
    ) {
        return put(usuariosUrl + "/" + id, body);
    }

    @Operation(summary = "Eliminar usuario")
    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<Object> eliminarUsuario(@PathVariable Long id) {
        return delete(usuariosUrl + "/" + id);
    }

    // =========================
    // METODOS AUXILIARES
    // =========================

    private ResponseEntity<Object> get(String url) {
        try {
            HttpHeaders headers = construirHeaders();

            if (tieneAuthorization(headers)) {
                return restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        new HttpEntity<>(headers),
                        Object.class
                );
            }

            return restTemplate.getForEntity(url, Object.class);
        } catch (RestClientResponseException ex) {
            return ResponseEntity
                    .status(ex.getStatusCode())
                    .body(ex.getResponseBodyAsString());
        } catch (Exception ex) {
            return ResponseEntity
                    .internalServerError()
                    .body(Map.of("error", "Error interno del BFF", "detalle", ex.getMessage()));
        }
    }

    private ResponseEntity<Object> post(String url, Object body) {
        try {
            HttpHeaders headers = construirHeaders();

            if (tieneAuthorization(headers)) {
                return restTemplate.exchange(
                        url,
                        HttpMethod.POST,
                        new HttpEntity<>(body, headers),
                        Object.class
                );
            }

            return restTemplate.postForEntity(url, body, Object.class);
        } catch (RestClientResponseException ex) {
            return ResponseEntity
                    .status(ex.getStatusCode())
                    .body(ex.getResponseBodyAsString());
        } catch (Exception ex) {
            return ResponseEntity
                    .internalServerError()
                    .body(Map.of("error", "Error interno del BFF", "detalle", ex.getMessage()));
        }
    }

    private ResponseEntity<Object> put(String url, Object body) {
        try {
            HttpHeaders headers = construirHeaders();
            HttpEntity<Object> entity = tieneAuthorization(headers)
                    ? new HttpEntity<>(body, headers)
                    : new HttpEntity<>(body);

            return restTemplate.exchange(
                    url,
                    HttpMethod.PUT,
                    entity,
                    Object.class
            );
        } catch (RestClientResponseException ex) {
            return ResponseEntity
                    .status(ex.getStatusCode())
                    .body(ex.getResponseBodyAsString());
        } catch (Exception ex) {
            return ResponseEntity
                    .internalServerError()
                    .body(Map.of("error", "Error interno del BFF", "detalle", ex.getMessage()));
        }
    }

    private ResponseEntity<Object> patch(String url, Object body) {
        try {
            HttpHeaders headers = construirHeaders();
            HttpEntity<Object> entity = tieneAuthorization(headers)
                    ? new HttpEntity<>(body, headers)
                    : new HttpEntity<>(body);

            return restTemplate.exchange(
                    url,
                    HttpMethod.PATCH,
                    entity,
                    Object.class
            );
        } catch (RestClientResponseException ex) {
            return ResponseEntity
                    .status(ex.getStatusCode())
                    .body(ex.getResponseBodyAsString());
        } catch (Exception ex) {
            return ResponseEntity
                    .internalServerError()
                    .body(Map.of("error", "Error interno del BFF", "detalle", ex.getMessage()));
        }
    }

    private ResponseEntity<Object> delete(String url) {
        try {
            HttpHeaders headers = construirHeaders();
            HttpEntity<?> entity = tieneAuthorization(headers)
                    ? new HttpEntity<>(headers)
                    : HttpEntity.EMPTY;

            return restTemplate.exchange(
                    url,
                    HttpMethod.DELETE,
                    entity,
                    Object.class
            );
        } catch (RestClientResponseException ex) {
            return ResponseEntity
                    .status(ex.getStatusCode())
                    .body(ex.getResponseBodyAsString());
        } catch (Exception ex) {
            return ResponseEntity
                    .internalServerError()
                    .body(Map.of("error", "Error interno del BFF", "detalle", ex.getMessage()));
        }
    }

    private HttpHeaders construirHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (attributes == null) {
            return headers;
        }

        HttpServletRequest request = attributes.getRequest();
        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authorization != null && !authorization.isBlank()) {
            headers.set(HttpHeaders.AUTHORIZATION, authorization);
        }

        return headers;
    }

    private boolean tieneAuthorization(HttpHeaders headers) {
        return headers.containsKey(HttpHeaders.AUTHORIZATION);
    }
}
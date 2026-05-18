package com.smartlogix.bff.controller;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/bff")
@CrossOrigin(origins = "*")
public class BffController {

    private final RestTemplate restTemplate;

    @Value("${servicios.inventario.url}")
    private String inventarioUrl;

    @Value("${servicios.pedidos.url}")
    private String pedidosUrl;

    @Value("${servicios.envios.url}")
    private String enviosUrl;

    public BffController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of(
            "servicio", "BFF SmartLogix",
            "estado", "OK",
            "frontend", "http://localhost:5173",
            "api", "/api/bff"
        );
    }

    // =========================
    // INVENTARIO
    // =========================

    @GetMapping("/productos")
    public ResponseEntity<Object> listarProductos(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return forwardGet(inventarioUrl, authorization);
    }

    @PostMapping("/productos")
    public ResponseEntity<Object> crearProducto(
            @RequestBody Map<String, Object> producto,
            @RequestHeader(value = "Authorization", required = false) String authorization) {

        Map<String, Object> body = new HashMap<>();
        body.put("codigo", producto.get("codigo"));
        body.put("nombre", producto.get("nombre"));
        body.put("descripcion", producto.get("descripcion"));
        body.put("precio", producto.get("precio"));
        body.put("stock", toInteger(producto.get("stock"), 0));

        return forward(inventarioUrl, HttpMethod.POST, body, authorization);
    }

    @PutMapping("/productos/{id}/stock")
    public ResponseEntity<Object> actualizarStock(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Authorization", required = false) String authorization) {

        Map<String, Object> body = Map.of("cantidad", toInteger(request.get("stock"), 0));
        return forward(inventarioUrl + "/" + id + "/stock", HttpMethod.PATCH, body, authorization);
    }

    // =========================
    // PEDIDOS
    // =========================

    @GetMapping("/pedidos")
    public ResponseEntity<Object> listarPedidos(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return forwardGet(pedidosUrl, authorization);
    }

    @PostMapping("/pedidos")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Object> crearPedido(
            @RequestBody Map<String, Object> pedido,
            @RequestHeader(value = "Authorization", required = false) String authorization) {

        Map<String, Object> body = new HashMap<>();
        body.put("cliente", pedido.get("cliente"));

        Object detalles = pedido.get("detalles");
        if (detalles == null) {
            detalles = pedido.get("items");
        }

        body.put("detalles", detalles != null ? detalles : List.of());
        return forward(pedidosUrl, HttpMethod.POST, body, authorization);
    }

    @PostMapping("/pedidos/{id}/aprobar")
    public ResponseEntity<Object> aprobarPedido(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authorization) {

        Map<String, Object> body = Map.of("estado", "APROBADO");
        return forward(pedidosUrl + "/" + id + "/estado", HttpMethod.PATCH, body, authorization);
    }

    // =========================
    // ENVIOS
    // =========================

    @GetMapping("/envios")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Object> listarEnvios(@RequestHeader(value = "Authorization", required = false) String authorization) {
        ResponseEntity<Object> response = forwardGet(enviosUrl, authorization);

        if (response.getBody() instanceof List<?> lista) {
            List<Map<String, Object>> normalizados = new ArrayList<>();
            for (Object item : lista) {
                if (item instanceof Map<?, ?> envioOriginal) {
                    normalizados.add(normalizarEnvio((Map<String, Object>) envioOriginal));
                }
            }
            return ResponseEntity.status(response.getStatusCode()).body(normalizados);
        }

        return response;
    }

    @PostMapping("/envios")
    public ResponseEntity<Object> crearEnvio(
            @RequestBody Map<String, Object> envio,
            @RequestHeader(value = "Authorization", required = false) String authorization) {

        Map<String, Object> body = new HashMap<>();
        body.put("pedidoId", toLong(envio.get("pedidoId"), 1L));
        body.put("usuarioId", toLong(envio.get("usuarioId"), 1L));
        body.put("direccionDestino", firstText(envio.get("direccionDestino"), envio.get("direccion"), "Sin dirección"));
        body.put("ciudadDestino", firstText(envio.get("ciudadDestino"), envio.get("ciudad"), "Santiago"));
        body.put("regionDestino", firstText(envio.get("regionDestino"), envio.get("region"), "Metropolitana"));
        body.put("transportista", firstText(envio.get("transportista"), null, "Sin transportista"));

        String fecha = firstText(envio.get("fechaEntregaEstimada"), envio.get("fechaEstimada"), null);
        if (fecha != null && !fecha.isBlank()) {
            body.put("fechaEntregaEstimada", normalizarFecha(fecha));
        }

        return forward(enviosUrl, HttpMethod.POST, body, authorization);
    }

    @PutMapping("/envios/{id}/estado")
    public ResponseEntity<Object> actualizarEstadoEnvio(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Authorization", required = false) String authorization) {

        Map<String, Object> body = Map.of("nuevoEstado", firstText(request.get("estado"), request.get("nuevoEstado"), "PENDIENTE"));
        return forward(enviosUrl + "/" + id + "/estado", HttpMethod.PATCH, body, authorization);
    }

    private ResponseEntity<Object> forwardGet(String url, String authorization) {
        return forward(url, HttpMethod.GET, null, authorization);
    }

    private ResponseEntity<Object> forward(String url, HttpMethod method, Object body, String authorization) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            // IMPORTANTE:
            // El BFF ya validó el token de Keycloak antes de llegar a este método.
            // Los microservicios son internos y no deben rechazar la llamada por problemas
            // de issuer/roles del token del usuario. Por eso NO reenviamos el Authorization
            // a Inventario, Pedidos ni Envios.

            HttpEntity<Object> entity = new HttpEntity<>(body, headers);
            return restTemplate.exchange(url, method, entity, Object.class);
        } catch (HttpStatusCodeException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ex.getResponseBodyAsString());
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "No se pudo comunicar con el microservicio",
                "detalle", ex.getMessage(),
                "url", url
            ));
        }
    }

    private Map<String, Object> normalizarEnvio(Map<String, Object> envio) {
        Map<String, Object> normalizado = new HashMap<>(envio);
        normalizado.put("direccion", envio.getOrDefault("direccion", envio.get("direccionDestino")));
        normalizado.put("fechaEstimada", envio.getOrDefault("fechaEstimada", envio.get("fechaEntregaEstimada")));
        return normalizado;
    }

    private Integer toInteger(Object value, Integer defaultValue) {
        if (value == null || value.toString().isBlank()) return defaultValue;
        return Integer.parseInt(value.toString());
    }

    private Long toLong(Object value, Long defaultValue) {
        if (value == null || value.toString().isBlank()) return defaultValue;
        return Long.parseLong(value.toString());
    }

    private String firstText(Object primary, Object secondary, String defaultValue) {
        if (primary != null && !primary.toString().isBlank()) return primary.toString();
        if (secondary != null && !secondary.toString().isBlank()) return secondary.toString();
        return defaultValue;
    }

    private String normalizarFecha(String fecha) {
        if (fecha.contains("T")) return fecha;
        return LocalDate.parse(fecha).atStartOfDay().toString();
    }
}

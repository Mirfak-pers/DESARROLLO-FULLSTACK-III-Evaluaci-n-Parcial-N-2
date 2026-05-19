package com.smartlogix.pedidos.service;

import com.smartlogix.pedidos.dto.ProductoInventarioResponse;
import com.smartlogix.pedidos.dto.StockRequest;
import com.smartlogix.pedidos.exception.StockNoDisponibleException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class InventarioClientService {

    private static final Logger logger =
            LoggerFactory.getLogger(InventarioClientService.class);

    private final RestTemplate restTemplate;
    private final HttpServletRequest request;

    @Value("${servicios.inventario.url:http://localhost:8081/api/inventario/productos}")
    private String inventarioServiceUrl;

    public InventarioClientService(RestTemplate restTemplate,
                                   HttpServletRequest request) {
        this.restTemplate = restTemplate;
        this.request = request;
    }

    @CircuitBreaker(
            name = "inventarioCircuitBreaker",
            fallbackMethod = "fallbackObtenerProducto"
    )
    public ProductoInventarioResponse obtenerProductoInventario(Long productoId) {

        logger.info("Consultando Inventario para producto ID: {}", productoId);

        HttpHeaders headers = crearHeadersConToken();
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<ProductoInventarioResponse> response =
                restTemplate.exchange(
                        inventarioServiceUrl + "/" + productoId,
                        HttpMethod.GET,
                        entity,
                        ProductoInventarioResponse.class
                );

        return response.getBody();
    }

    @CircuitBreaker(
            name = "inventarioCircuitBreaker",
            fallbackMethod = "fallbackDescontarStock"
    )
    public void descontarStock(Long productoId, Integer cantidad) {

        logger.info(
                "Solicitando descuento de stock en Inventario. Producto ID: {}, cantidad: {}",
                productoId,
                cantidad
        );

        HttpHeaders headers = crearHeadersConToken();
        HttpEntity<StockRequest> entity =
                new HttpEntity<>(new StockRequest(cantidad), headers);

        restTemplate.exchange(
                inventarioServiceUrl + "/" + productoId + "/descontar-stock",
                HttpMethod.POST,
                entity,
                Object.class
        );
    }

    private HttpHeaders crearHeadersConToken() {
        HttpHeaders headers = new HttpHeaders();

        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authorization != null && authorization.startsWith("Bearer ")) {
            headers.set(HttpHeaders.AUTHORIZATION, authorization);
        } else {
            logger.warn("No se encontró token Authorization en la solicitud hacia Pedidos");
        }

        return headers;
    }

    public ProductoInventarioResponse fallbackObtenerProducto(
            Long productoId,
            Throwable ex
    ) {

        logger.error(
                "Circuit Breaker activado al consultar Inventario. Producto ID: {}. Error: {}",
                productoId,
                ex.getMessage()
        );

        throw new StockNoDisponibleException(
                "No se pudo consultar Inventario. Circuit Breaker activado para producto ID: "
                        + productoId
        );
    }

    public void fallbackDescontarStock(
            Long productoId,
            Integer cantidad,
            Throwable ex
    ) {

        logger.error(
                "Circuit Breaker activado al descontar stock. Producto ID: {}, cantidad: {}. Error: {}",
                productoId,
                cantidad,
                ex.getMessage()
        );

        throw new StockNoDisponibleException(
                "No se pudo descontar stock. Circuit Breaker activado para producto ID: "
                        + productoId
        );
    }
}
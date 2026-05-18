package com.smartlogix.pedidos.service;

import com.smartlogix.pedidos.dto.ProductoInventarioResponse;
import com.smartlogix.pedidos.dto.StockRequest;
import com.smartlogix.pedidos.exception.StockNoDisponibleException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class InventarioClientService {

    private static final Logger logger =
            LoggerFactory.getLogger(InventarioClientService.class);

    private final RestTemplate restTemplate;

    @Value("${servicios.inventario.url:http://localhost:8081/api/inventario/productos}")
    private String inventarioServiceUrl;

    public InventarioClientService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @CircuitBreaker(
            name = "inventarioCircuitBreaker",
            fallbackMethod = "fallbackObtenerProducto"
    )
    public ProductoInventarioResponse obtenerProductoInventario(Long productoId) {

        logger.info("Consultando Inventario para producto ID: {}", productoId);

        return restTemplate.getForObject(
                inventarioServiceUrl + "/" + productoId,
                ProductoInventarioResponse.class
        );
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

        restTemplate.postForObject(
                inventarioServiceUrl + "/" + productoId + "/descontar-stock",
                new StockRequest(cantidad),
                Object.class
        );
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
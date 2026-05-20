package com.smartlogix.Inventario.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/**
 * Manejador global de excepciones para msInventario.
 *
 * Captura todas las excepciones del dominio y las convierte en respuestas JSON
 * coherentes con la estructura:
 *   {
 *     "error":     "mensaje descriptivo",
 *     "codigo":    "CODIGO_ERROR",
 *     "timestamp": "2025-05-20T10:00:00"
 *   }
 *
 * Para errores de validación, incluye además el mapa campo → mensaje.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ──────────────────────────────────────────────────────────────────────────
    // Errores de dominio
    // ──────────────────────────────────────────────────────────────────────────

    @ExceptionHandler(ProductoNoEncontradoException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, Object> manejarProductoNoEncontrado(ProductoNoEncontradoException ex) {
        logger.warn("[404] ProductoNoEncontrado: {}", ex.getMessage());
        return respuesta("PRODUCTO_NO_ENCONTRADO", ex.getMessage());
    }

    @ExceptionHandler(ProductoDuplicadoException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String, Object> manejarProductoDuplicado(ProductoDuplicadoException ex) {
        logger.warn("[409] ProductoDuplicado: {}", ex.getMessage());
        return respuesta("PRODUCTO_DUPLICADO", ex.getMessage());
    }

    @ExceptionHandler(StockInsuficienteException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> manejarStockInsuficiente(StockInsuficienteException ex) {
        logger.warn("[400] StockInsuficiente: {}", ex.getMessage());
        return respuesta("STOCK_INSUFICIENTE", ex.getMessage());
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Errores de validación (Jakarta Validation / @Valid)
    // ──────────────────────────────────────────────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> manejarValidaciones(MethodArgumentNotValidException ex) {
        logger.warn("[400] Error de validación en request body");

        Map<String, Object> respuesta = respuesta(
                "VALIDACION_FALLIDA",
                "Los datos enviados no son válidos. Revisa los campos indicados."
        );

        Map<String, String> campos = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(err -> campos.put(err.getField(), err.getDefaultMessage()));
        respuesta.put("campos", campos);

        return respuesta;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Error de tipo en path variable (ej: /productos/abc cuando espera Long)
    // ──────────────────────────────────────────────────────────────────────────

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> manejarTipoInvalido(MethodArgumentTypeMismatchException ex) {
        String mensaje = String.format(
                "El parámetro '%s' debe ser de tipo %s, pero se recibió: '%s'",
                ex.getName(),
                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "desconocido",
                ex.getValue()
        );
        logger.warn("[400] TipoInvalido: {}", mensaje);
        return respuesta("TIPO_INVALIDO", mensaje);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Fallback genérico (errores no previstos)
    // ──────────────────────────────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Map<String, Object> manejarErrorGenerico(Exception ex) {
        logger.error("[500] Error inesperado: {}", ex.getMessage(), ex);
        return respuesta("ERROR_INTERNO", "Ocurrió un error interno en el servidor. Intenta nuevamente más tarde.");
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Helper
    // ──────────────────────────────────────────────────────────────────────────

    private Map<String, Object> respuesta(String codigo, String mensaje) {
        Map<String, Object> map = new HashMap<>();
        map.put("error", mensaje);
        map.put("codigo", codigo);
        map.put("timestamp", LocalDateTime.now().toString());
        return map;
    }
}

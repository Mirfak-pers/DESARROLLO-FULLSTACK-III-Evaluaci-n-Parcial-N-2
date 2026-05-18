package com.smartlogix.Inventario.exception;

/**
 *
 * @author Gubier
 */

public class StockInsuficienteException extends RuntimeException {
    public StockInsuficienteException(String mensaje) {
        super(mensaje);
    }
}
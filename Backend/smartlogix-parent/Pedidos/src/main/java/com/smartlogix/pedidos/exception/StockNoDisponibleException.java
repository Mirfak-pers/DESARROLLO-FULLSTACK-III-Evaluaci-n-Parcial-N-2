package com.smartlogix.pedidos.exception;

public class StockNoDisponibleException extends RuntimeException {

    public StockNoDisponibleException(String mensaje) {
        super(mensaje);
    }
}
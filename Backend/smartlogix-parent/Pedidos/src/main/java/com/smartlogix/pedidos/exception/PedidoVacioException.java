package com.smartlogix.pedidos.exception;

public class PedidoVacioException extends RuntimeException {
    public PedidoVacioException(String mensaje) {
        super(mensaje);
    }
}

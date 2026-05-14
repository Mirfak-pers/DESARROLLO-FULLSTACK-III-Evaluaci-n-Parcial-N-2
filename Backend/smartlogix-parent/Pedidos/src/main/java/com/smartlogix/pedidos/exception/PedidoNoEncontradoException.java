package com.smartlogix.pedidos.exception;

public class PedidoNoEncontradoException extends RuntimeException {

    public PedidoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}
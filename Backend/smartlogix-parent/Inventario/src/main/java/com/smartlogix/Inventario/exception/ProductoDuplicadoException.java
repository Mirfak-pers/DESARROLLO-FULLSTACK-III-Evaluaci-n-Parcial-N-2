package com.smartlogix.Inventario.exception;

public class ProductoDuplicadoException extends RuntimeException {

    public ProductoDuplicadoException(String mensaje) {
        super(mensaje);
    }
}
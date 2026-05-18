package com.smartlogix.Inventario.exception;

/**
 *
 * @author Gubier
 */

public class ProductoNoEncontradoException extends RuntimeException {
    public ProductoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}
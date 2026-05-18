package com.smartlogix.Inventario.exception;

/**
 *
 * @author Gubier
 */

public class ProductoDuplicadoException extends RuntimeException {
    public ProductoDuplicadoException(String mensaje) {
        super(mensaje);
    }
}
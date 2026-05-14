package com.smartlogix.pedidos.dto;

public class ProductoInventarioResponse {

    private Long id;
    private String codigo;
    private String nombre;
    private String descripcion;
    private Integer stock;

    public Long getId() {
        return id;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getNombre() {
        return nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public Integer getStock() {
        return stock;
    }
}
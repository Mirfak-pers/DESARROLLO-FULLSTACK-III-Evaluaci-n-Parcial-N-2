package com.smartlogix.Inventario.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

/**
 *
 * @author Gubier
 */

@Entity
@Table(name = "productos", uniqueConstraints = {
    @UniqueConstraint(columnNames = "codigo")
})
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String codigo;

    @NotBlank
    @Column(nullable = false)
    private String nombre;

    private String descripcion;

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal precio;

    @Min(0)
    @Column(nullable = false)
    private Integer stock;

    public Producto() {
    }

    public Producto(String codigo, String nombre, String descripcion, BigDecimal precio, Integer stock) {
        this.codigo = codigo;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.stock = stock;
    }

    public Long getId() {
        return id;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }
}
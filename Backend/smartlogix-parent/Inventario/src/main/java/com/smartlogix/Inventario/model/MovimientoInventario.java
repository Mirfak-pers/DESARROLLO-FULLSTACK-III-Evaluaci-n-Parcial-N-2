package com.smartlogix.Inventario.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 *
 * @author Gubier
 */

@Entity
@Table(name = "movimientos_inventario")
public class MovimientoInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long productoId;

    private String codigoProducto;

    @Enumerated(EnumType.STRING)
    private TipoMovimiento tipoMovimiento;

    private Integer cantidad;

    private Integer stockFinal;

    private LocalDateTime fechaMovimiento;

    public MovimientoInventario() {
    }

    public MovimientoInventario(Long productoId, String codigoProducto, TipoMovimiento tipoMovimiento, Integer cantidad, Integer stockFinal) {
        this.productoId = productoId;
        this.codigoProducto = codigoProducto;
        this.tipoMovimiento = tipoMovimiento;
        this.cantidad = cantidad;
        this.stockFinal = stockFinal;
        this.fechaMovimiento = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getProductoId() {
        return productoId;
    }

    public String getCodigoProducto() {
        return codigoProducto;
    }

    public TipoMovimiento getTipoMovimiento() {
        return tipoMovimiento;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public Integer getStockFinal() {
        return stockFinal;
    }

    public LocalDateTime getFechaMovimiento() {
        return fechaMovimiento;
    }
}
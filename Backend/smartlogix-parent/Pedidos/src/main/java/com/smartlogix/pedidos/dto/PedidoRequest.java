package com.smartlogix.pedidos.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class PedidoRequest {

    @NotBlank(message = "El cliente es obligatorio")
    private String cliente;

    @Valid
    @NotEmpty(message = "El pedido debe tener al menos un producto")
    private List<DetallePedidoRequest> detalles;

    public String getCliente() {
        return cliente;
    }

    public void setCliente(String cliente) {
        this.cliente = cliente;
    }

    public List<DetallePedidoRequest> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<DetallePedidoRequest> detalles) {
        this.detalles = detalles;
    }
}
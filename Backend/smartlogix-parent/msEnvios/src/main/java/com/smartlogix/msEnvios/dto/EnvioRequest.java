package com.smartlogix.msEnvios.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EnvioRequest {

    @NotNull(message = "El ID del pedido es obligatorio")
    private Long pedidoId;

    @NotNull(message = "El ID del usuario es obligatorio")
    private Long usuarioId;

    @NotBlank(message = "La dirección de destino es obligatoria")
    private String direccionDestino;

    @NotBlank(message = "La ciudad de destino es obligatoria")
    private String ciudadDestino;

    @NotBlank(message = "La región de destino es obligatoria")
    private String regionDestino;

    private LocalDateTime fechaEntregaEstimada;

    private String transportista;
}

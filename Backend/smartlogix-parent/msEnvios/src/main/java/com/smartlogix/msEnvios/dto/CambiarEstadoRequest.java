package com.smartlogix.msEnvios.dto;

import com.smartlogix.msEnvios.model.EstadoEnvio;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CambiarEstadoRequest {

    @NotNull(message = "El nuevo estado es obligatorio")
    private EstadoEnvio nuevoEstado;
}

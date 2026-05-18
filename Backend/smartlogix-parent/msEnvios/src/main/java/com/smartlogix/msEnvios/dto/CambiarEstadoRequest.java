package com.smartlogix.msEnvios.dto;

import com.smartlogix.msEnvios.model.EstadoEnvio;
import jakarta.validation.constraints.NotNull;

public class CambiarEstadoRequest {

    @NotNull(message = "El nuevo estado es obligatorio")
    private EstadoEnvio nuevoEstado;

    public CambiarEstadoRequest() {}

    public EstadoEnvio getNuevoEstado() { return nuevoEstado; }
    public void setNuevoEstado(EstadoEnvio nuevoEstado) { this.nuevoEstado = nuevoEstado; }
}

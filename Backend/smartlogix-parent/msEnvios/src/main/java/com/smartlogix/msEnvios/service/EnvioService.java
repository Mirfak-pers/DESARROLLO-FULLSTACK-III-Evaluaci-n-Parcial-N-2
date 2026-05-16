package com.smartlogix.msEnvios.service;

import com.smartlogix.msEnvios.dto.CambiarEstadoRequest;
import com.smartlogix.msEnvios.dto.EnvioRequest;
import com.smartlogix.msEnvios.exception.EnvioNoEncontradoException;
import com.smartlogix.msEnvios.model.Envio;
import com.smartlogix.msEnvios.model.EstadoEnvio;
import com.smartlogix.msEnvios.repository.EnvioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class EnvioService {

    private final EnvioRepository envioRepository;

    public EnvioService(EnvioRepository envioRepository) {
        this.envioRepository = envioRepository;
    }

    // Crear un nuevo envío
    public Envio crearEnvio(EnvioRequest request) {
        Envio envio = new Envio();
        envio.setPedidoId(request.getPedidoId());
        envio.setUsuarioId(request.getUsuarioId());
        envio.setDireccionDestino(request.getDireccionDestino());
        envio.setCiudadDestino(request.getCiudadDestino());
        envio.setRegionDestino(request.getRegionDestino());
        envio.setFechaEntregaEstimada(request.getFechaEntregaEstimada());
        envio.setTransportista(request.getTransportista());
        envio.setNumeroSeguimiento(generarNumeroSeguimiento());
        envio.setEstado(EstadoEnvio.PENDIENTE);
        return envioRepository.save(envio);
    }

    // Listar todos los envíos
    public List<Envio> listarTodos() {
        return envioRepository.findAll();
    }

    // Buscar por ID
    public Envio buscarPorId(Long id) {
        return envioRepository.findById(id)
                .orElseThrow(() -> new EnvioNoEncontradoException("Envío no encontrado con ID: " + id));
    }

    // Buscar por número de seguimiento
    public Envio buscarPorSeguimiento(String numeroSeguimiento) {
        return envioRepository.findByNumeroSeguimiento(numeroSeguimiento)
                .orElseThrow(() -> new EnvioNoEncontradoException("Envío no encontrado con seguimiento: " + numeroSeguimiento));
    }

    // Buscar envíos por usuario
    public List<Envio> buscarPorUsuario(Long usuarioId) {
        return envioRepository.findByUsuarioId(usuarioId);
    }

    // Buscar envíos por pedido
    public List<Envio> buscarPorPedido(Long pedidoId) {
        return envioRepository.findByPedidoId(pedidoId);
    }

    // Buscar envíos por estado
    public List<Envio> buscarPorEstado(EstadoEnvio estado) {
        return envioRepository.findByEstado(estado);
    }

    // Cambiar estado del envío
    public Envio cambiarEstado(Long id, CambiarEstadoRequest request) {
        Envio envio = buscarPorId(id);
        envio.setEstado(request.getNuevoEstado());

        // Si se marca como entregado, registrar la fecha real
        if (request.getNuevoEstado() == EstadoEnvio.ENTREGADO) {
            envio.setFechaEntregaReal(LocalDateTime.now());
        }

        return envioRepository.save(envio);
    }

    // Eliminar envío
    public void eliminarEnvio(Long id) {
        Envio envio = buscarPorId(id);
        envioRepository.delete(envio);
    }

    // Generar número de seguimiento único
    private String generarNumeroSeguimiento() {
        return "SL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}

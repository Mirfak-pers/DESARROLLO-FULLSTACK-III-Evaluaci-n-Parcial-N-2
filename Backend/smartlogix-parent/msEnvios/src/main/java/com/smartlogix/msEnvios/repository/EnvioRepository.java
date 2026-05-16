package com.smartlogix.msEnvios.repository;

import com.smartlogix.msEnvios.model.Envio;
import com.smartlogix.msEnvios.model.EstadoEnvio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnvioRepository extends JpaRepository<Envio, Long> {

    Optional<Envio> findByNumeroSeguimiento(String numeroSeguimiento);

    List<Envio> findByUsuarioId(Long usuarioId);

    List<Envio> findByPedidoId(Long pedidoId);

    List<Envio> findByEstado(EstadoEnvio estado);
}

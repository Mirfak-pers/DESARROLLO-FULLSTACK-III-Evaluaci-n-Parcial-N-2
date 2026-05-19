package com.smartlogix.msEnvios.service;

import com.smartlogix.msEnvios.dto.CambiarEstadoRequest;
import com.smartlogix.msEnvios.dto.EnvioRequest;
import com.smartlogix.msEnvios.exception.EnvioNoEncontradoException;
import com.smartlogix.msEnvios.model.Envio;
import com.smartlogix.msEnvios.model.EstadoEnvio;
import com.smartlogix.msEnvios.repository.EnvioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EnvioServiceTest {

    @Mock
    private EnvioRepository envioRepository;

    @InjectMocks
    private EnvioService envioService;

    private EnvioRequest envioRequest;

    @BeforeEach
    void setUp() {
        envioRequest = new EnvioRequest();
        envioRequest.setPedidoId(1L);
        envioRequest.setUsuarioId(10L);
        envioRequest.setDireccionDestino("Av. Principal 123");
        envioRequest.setCiudadDestino("Santiago");
        envioRequest.setRegionDestino("Metropolitana");
        envioRequest.setTransportista("Chilexpress");
        envioRequest.setFechaEntregaEstimada(LocalDateTime.now().plusDays(3));
    }

    @Test
    void crearEnvio_deberiaCrearEnvioCorrectamente() {
        when(envioRepository.save(any(Envio.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Envio resultado = envioService.crearEnvio(envioRequest);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getPedidoId());
        assertEquals(10L, resultado.getUsuarioId());
        assertEquals("Av. Principal 123", resultado.getDireccionDestino());
        assertEquals("Santiago", resultado.getCiudadDestino());
        assertEquals("Metropolitana", resultado.getRegionDestino());
        assertEquals("Chilexpress", resultado.getTransportista());
        assertEquals(EstadoEnvio.PENDIENTE, resultado.getEstado());
        assertNotNull(resultado.getNumeroSeguimiento());

        verify(envioRepository).save(any(Envio.class));
    }

    @Test
    void listarTodos_deberiaRetornarListaDeEnvios() {
        Envio envio1 = new Envio();
        envio1.setPedidoId(1L);
        envio1.setUsuarioId(10L);
        envio1.setDireccionDestino("Av. Principal 123");
        envio1.setCiudadDestino("Santiago");
        envio1.setRegionDestino("Metropolitana");
        envio1.setEstado(EstadoEnvio.PENDIENTE);
        envio1.setNumeroSeguimiento("SL-ABC12345");

        Envio envio2 = new Envio();
        envio2.setPedidoId(2L);
        envio2.setUsuarioId(11L);
        envio2.setDireccionDestino("Calle Norte 456");
        envio2.setCiudadDestino("Valparaíso");
        envio2.setRegionDestino("Valparaíso");
        envio2.setEstado(EstadoEnvio.EN_TRANSITO);
        envio2.setNumeroSeguimiento("SL-XYZ98765");

        when(envioRepository.findAll())
                .thenReturn(List.of(envio1, envio2));

        List<Envio> resultado = envioService.listarTodos();

        assertNotNull(resultado);
        assertEquals(2, resultado.size());
        assertEquals(1L, resultado.get(0).getPedidoId());
        assertEquals(2L, resultado.get(1).getPedidoId());

        verify(envioRepository).findAll();
    }

    @Test
    void buscarPorId_deberiaLanzarErrorCuandoEnvioNoExiste() {
        when(envioRepository.findById(99L))
                .thenReturn(Optional.empty());

        EnvioNoEncontradoException exception = assertThrows(
                EnvioNoEncontradoException.class,
                () -> envioService.buscarPorId(99L)
        );

        assertEquals(
                "Envío no encontrado con ID: 99",
                exception.getMessage()
        );

        verify(envioRepository).findById(99L);
    }

    @Test
    void cambiarEstado_deberiaActualizarEstadoDelEnvio() {
        Envio envioExistente = new Envio();
        envioExistente.setPedidoId(1L);
        envioExistente.setUsuarioId(10L);
        envioExistente.setDireccionDestino("Av. Principal 123");
        envioExistente.setCiudadDestino("Santiago");
        envioExistente.setRegionDestino("Metropolitana");
        envioExistente.setEstado(EstadoEnvio.PENDIENTE);
        envioExistente.setNumeroSeguimiento("SL-ABC12345");

        CambiarEstadoRequest request = new CambiarEstadoRequest();
        request.setNuevoEstado(EstadoEnvio.ENTREGADO);

        when(envioRepository.findById(1L))
                .thenReturn(Optional.of(envioExistente));

        when(envioRepository.save(any(Envio.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Envio resultado = envioService.cambiarEstado(1L, request);

        assertNotNull(resultado);
        assertEquals(EstadoEnvio.ENTREGADO, resultado.getEstado());
        assertNotNull(resultado.getFechaEntregaReal());

        verify(envioRepository).findById(1L);
        verify(envioRepository).save(envioExistente);
    }
}
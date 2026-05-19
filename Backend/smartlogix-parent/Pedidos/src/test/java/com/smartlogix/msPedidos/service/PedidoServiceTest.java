package com.smartlogix.msPedidos.service;

import com.smartlogix.pedidos.dto.CambiarEstadoRequest;
import com.smartlogix.pedidos.dto.DetallePedidoRequest;
import com.smartlogix.pedidos.dto.PedidoRequest;
import com.smartlogix.pedidos.dto.ProductoInventarioResponse;
import com.smartlogix.pedidos.exception.PedidoVacioException;
import com.smartlogix.pedidos.exception.StockNoDisponibleException;
import com.smartlogix.pedidos.model.EstadoPedido;
import com.smartlogix.pedidos.model.Pedido;
import com.smartlogix.pedidos.repository.DetallePedidoRepository;
import com.smartlogix.pedidos.repository.PedidoRepository;
import com.smartlogix.pedidos.service.InventarioClientService;
import com.smartlogix.pedidos.service.PedidoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {

    @Mock
    private PedidoRepository pedidoRepository;

    @Mock
    private DetallePedidoRepository detallePedidoRepository;

    @Mock
    private InventarioClientService inventarioClientService;

    @InjectMocks
    private PedidoService pedidoService;

    private PedidoRequest pedidoRequest;
    private ProductoInventarioResponse productoInventario;

    @BeforeEach
    void setUp() {
        DetallePedidoRequest detalle = new DetallePedidoRequest();
        detalle.setProductoId(1L);
        detalle.setCantidad(2);

        pedidoRequest = new PedidoRequest();
        pedidoRequest.setCliente("Cliente prueba");
        pedidoRequest.setDetalles(List.of(detalle));

        productoInventario = new ProductoInventarioResponse();
        productoInventario.setId(1L);
        productoInventario.setCodigo("PROD-001");
        productoInventario.setNombre("Teclado Gamer");
        productoInventario.setStock(10);
    }

    @Test
    void crearPedido_deberiaCrearPedidoCorrectamenteCuandoHayStock() {
        when(inventarioClientService.obtenerProductoInventario(1L))
                .thenReturn(productoInventario);

        when(pedidoRepository.save(any(Pedido.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Pedido resultado = pedidoService.crearPedido(pedidoRequest);

        assertNotNull(resultado);
        assertEquals("Cliente prueba", resultado.getCliente());
        assertEquals(EstadoPedido.VALIDADO, resultado.getEstado());
        assertEquals(1, resultado.getDetalles().size());
        assertEquals(1L, resultado.getDetalles().get(0).getProductoId());
        assertEquals(2, resultado.getDetalles().get(0).getCantidad());

        verify(inventarioClientService).obtenerProductoInventario(1L);
        verify(inventarioClientService).descontarStock(1L, 2);

        verify(pedidoRepository, times(2)).save(any(Pedido.class));
    }

    @Test
    void crearPedido_deberiaLanzarErrorCuandoPedidoEstaVacio() {
        PedidoRequest requestVacio = new PedidoRequest();
        requestVacio.setCliente("Cliente prueba");
        requestVacio.setDetalles(Collections.emptyList());

        PedidoVacioException exception = assertThrows(
                PedidoVacioException.class,
                () -> pedidoService.crearPedido(requestVacio)
        );

        assertEquals(
                "No se puede crear un pedido vacío",
                exception.getMessage()
        );

        verify(pedidoRepository, never()).save(any(Pedido.class));
        verify(inventarioClientService, never()).obtenerProductoInventario(anyLong());
        verify(inventarioClientService, never()).descontarStock(anyLong(), anyInt());
    }

    @Test
    void crearPedido_deberiaLanzarErrorCuandoNoHayStockSuficiente() {
        productoInventario.setStock(1);

        when(inventarioClientService.obtenerProductoInventario(1L))
                .thenReturn(productoInventario);

        StockNoDisponibleException exception = assertThrows(
                StockNoDisponibleException.class,
                () -> pedidoService.crearPedido(pedidoRequest)
        );

        assertEquals(
                "Stock insuficiente para el producto ID: 1",
                exception.getMessage()
        );

        verify(inventarioClientService).obtenerProductoInventario(1L);
        verify(pedidoRepository, never()).save(any(Pedido.class));
        verify(inventarioClientService, never()).descontarStock(anyLong(), anyInt());
    }

    @Test
    void cambiarEstado_deberiaActualizarEstadoDelPedido() {
        Pedido pedidoExistente = new Pedido("Cliente prueba");
        pedidoExistente.setEstado(EstadoPedido.CREADO);

        CambiarEstadoRequest request = new CambiarEstadoRequest();
        request.setEstado(EstadoPedido.APROBADO);

        when(pedidoRepository.findById(1L))
                .thenReturn(Optional.of(pedidoExistente));

        when(pedidoRepository.save(any(Pedido.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Pedido resultado = pedidoService.cambiarEstado(1L, request);

        assertNotNull(resultado);
        assertEquals(EstadoPedido.APROBADO, resultado.getEstado());

        verify(pedidoRepository).findById(1L);
        verify(pedidoRepository, atLeastOnce()).save(pedidoExistente);
    }
}
package com.smartlogix.Inventario.service;

import com.smartlogix.Inventario.dto.ProductoRequest;
import com.smartlogix.Inventario.dto.StockRequest;
import com.smartlogix.Inventario.exception.ProductoDuplicadoException;
import com.smartlogix.Inventario.exception.StockInsuficienteException;
import com.smartlogix.Inventario.model.MovimientoInventario;
import com.smartlogix.Inventario.model.Producto;
import com.smartlogix.Inventario.repository.MovimientoInventarioRepository;
import com.smartlogix.Inventario.repository.ProductoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private MovimientoInventarioRepository movimientoRepository;

    @InjectMocks
    private ProductoService productoService;

    private ProductoRequest productoRequest;

    @BeforeEach
    void setUp() {
        productoRequest = new ProductoRequest();
        productoRequest.setCodigo("PROD-001");
        productoRequest.setNombre("Teclado Gamer");
        productoRequest.setDescripcion("Teclado mecánico RGB");
        productoRequest.setStock(10);
        productoRequest.setPrecio(new BigDecimal("29990"));
    }

    @Test
    void registrarProducto_deberiaGuardarProductoCorrectamente() {
        Producto productoGuardado = new Producto(
                productoRequest.getCodigo(),
                productoRequest.getNombre(),
                productoRequest.getDescripcion(),
                productoRequest.getStock(),
                productoRequest.getPrecio()
        );

        when(productoRepository.findByCodigo("PROD-001"))
                .thenReturn(Optional.empty());

        when(productoRepository.save(any(Producto.class)))
                .thenReturn(productoGuardado);

        Producto resultado = productoService.registrarProducto(productoRequest);

        assertNotNull(resultado);
        assertEquals("PROD-001", resultado.getCodigo());
        assertEquals("Teclado Gamer", resultado.getNombre());
        assertEquals(10, resultado.getStock());
        assertEquals(new BigDecimal("29990"), resultado.getPrecio());

        verify(productoRepository).findByCodigo("PROD-001");
        verify(productoRepository).save(any(Producto.class));
        verify(movimientoRepository).save(any(MovimientoInventario.class));
    }

    @Test
    void registrarProducto_deberiaLanzarErrorCuandoCodigoYaExiste() {
        Producto productoExistente = new Producto(
                "PROD-001",
                "Teclado Existente",
                "Producto ya registrado",
                5,
                new BigDecimal("19990")
        );

        when(productoRepository.findByCodigo("PROD-001"))
                .thenReturn(Optional.of(productoExistente));

        ProductoDuplicadoException exception = assertThrows(
                ProductoDuplicadoException.class,
                () -> productoService.registrarProducto(productoRequest)
        );

        assertEquals(
                "Ya existe un producto con código: PROD-001",
                exception.getMessage()
        );

        verify(productoRepository).findByCodigo("PROD-001");
        verify(productoRepository, never()).save(any(Producto.class));
        verify(movimientoRepository, never()).save(any(MovimientoInventario.class));
    }

    @Test
    void descontarStock_deberiaLanzarErrorCuandoNoHayStockSuficiente() {
        Producto productoExistente = new Producto(
                "PROD-001",
                "Teclado Gamer",
                "Teclado mecánico RGB",
                5,
                new BigDecimal("29990")
        );

        StockRequest stockRequest = new StockRequest();
        stockRequest.setCantidad(10);

        when(productoRepository.findById(1L))
                .thenReturn(Optional.of(productoExistente));

        StockInsuficienteException exception = assertThrows(
                StockInsuficienteException.class,
                () -> productoService.descontarStock(1L, stockRequest)
        );

        assertEquals(
                "Stock insuficiente para producto ID: 1",
                exception.getMessage()
        );

        verify(productoRepository).findById(1L);
        verify(productoRepository, never()).save(any(Producto.class));
        verify(movimientoRepository, never()).save(any(MovimientoInventario.class));
    }

    @Test
    void descontarStock_deberiaActualizarStockCuandoHayStockSuficiente() {
        Producto productoExistente = new Producto(
                "PROD-001",
                "Teclado Gamer",
                "Teclado mecánico RGB",
                10,
                new BigDecimal("29990")
        );

        Producto productoActualizado = new Producto(
                "PROD-001",
                "Teclado Gamer",
                "Teclado mecánico RGB",
                6,
                new BigDecimal("29990")
        );

        StockRequest stockRequest = new StockRequest();
        stockRequest.setCantidad(4);

        when(productoRepository.findById(1L))
                .thenReturn(Optional.of(productoExistente));

        when(productoRepository.save(any(Producto.class)))
                .thenReturn(productoActualizado);

        Producto resultado = productoService.descontarStock(1L, stockRequest);

        assertNotNull(resultado);
        assertEquals("PROD-001", resultado.getCodigo());
        assertEquals("Teclado Gamer", resultado.getNombre());
        assertEquals(6, resultado.getStock());

        verify(productoRepository).findById(1L);
        verify(productoRepository).save(any(Producto.class));
        verify(movimientoRepository).save(any(MovimientoInventario.class));
    }
}
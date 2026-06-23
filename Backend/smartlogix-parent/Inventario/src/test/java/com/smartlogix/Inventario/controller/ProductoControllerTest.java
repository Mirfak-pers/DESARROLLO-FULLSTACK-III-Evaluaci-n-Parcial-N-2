package com.smartlogix.Inventario.controller;

import com.smartlogix.Inventario.dto.ProductoRequest;
import com.smartlogix.Inventario.dto.StockRequest;
import com.smartlogix.Inventario.model.MovimientoInventario;
import com.smartlogix.Inventario.model.Producto;
import com.smartlogix.Inventario.model.TipoMovimiento;
import com.smartlogix.Inventario.service.ProductoService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductoControllerTest {

    @Mock
    private ProductoService productoService;

    @InjectMocks
    private ProductoController productoController;

    private Producto crearProducto() {
        return new Producto(
                "PROD-001",
                "Teclado Gamer",
                "Teclado mecánico RGB",
                10,
                new BigDecimal("29990")
        );
    }

    private ProductoRequest crearProductoRequest() {
        ProductoRequest request = new ProductoRequest();
        request.setCodigo("PROD-001");
        request.setNombre("Teclado Gamer");
        request.setDescripcion("Teclado mecánico RGB");
        request.setStock(10);
        request.setPrecio(new BigDecimal("29990"));
        return request;
    }

    private StockRequest crearStockRequest(Integer cantidad) {
        StockRequest request = new StockRequest();
        request.setCantidad(cantidad);
        return request;
    }

    @Test
    void listarProductos_deberiaRetornarListaDeProductos() {
        Producto producto1 = crearProducto();

        Producto producto2 = new Producto(
                "PROD-002",
                "Mouse Gamer",
                "Mouse óptico",
                20,
                new BigDecimal("19990")
        );

        when(productoService.listarProductos()).thenReturn(List.of(producto1, producto2));

        List<Producto> resultado = productoController.listarProductos();

        assertNotNull(resultado);
        assertEquals(2, resultado.size());
        assertEquals("PROD-001", resultado.get(0).getCodigo());
        assertEquals("PROD-002", resultado.get(1).getCodigo());

        verify(productoService).listarProductos();
    }

    @Test
    void buscarPorId_deberiaRetornarProducto() {
        Producto producto = crearProducto();

        when(productoService.buscarPorId(1L)).thenReturn(producto);

        Producto resultado = productoController.buscarPorId(1L);

        assertNotNull(resultado);
        assertEquals("PROD-001", resultado.getCodigo());
        assertEquals("Teclado Gamer", resultado.getNombre());

        verify(productoService).buscarPorId(1L);
    }

    @Test
    void registrarProducto_deberiaRetornarProductoCreado() {
        ProductoRequest request = crearProductoRequest();
        Producto producto = crearProducto();

        when(productoService.registrarProducto(request)).thenReturn(producto);

        Producto resultado = productoController.registrarProducto(request);

        assertNotNull(resultado);
        assertEquals("PROD-001", resultado.getCodigo());
        assertEquals(10, resultado.getStock());

        verify(productoService).registrarProducto(request);
    }

    @Test
    void actualizarStock_deberiaRetornarProductoActualizado() {
        StockRequest request = crearStockRequest(25);

        Producto productoActualizado = new Producto(
                "PROD-001",
                "Teclado Gamer",
                "Teclado mecánico RGB",
                25,
                new BigDecimal("29990")
        );

        when(productoService.actualizarStock(1L, request)).thenReturn(productoActualizado);

        Producto resultado = productoController.actualizarStock(1L, request);

        assertNotNull(resultado);
        assertEquals(25, resultado.getStock());

        verify(productoService).actualizarStock(1L, request);
    }

    @Test
    void descontarStock_deberiaRetornarProductoConStockDescontado() {
        StockRequest request = crearStockRequest(4);

        Producto productoActualizado = new Producto(
                "PROD-001",
                "Teclado Gamer",
                "Teclado mecánico RGB",
                6,
                new BigDecimal("29990")
        );

        when(productoService.descontarStock(1L, request)).thenReturn(productoActualizado);

        Producto resultado = productoController.descontarStock(1L, request);

        assertNotNull(resultado);
        assertEquals(6, resultado.getStock());

        verify(productoService).descontarStock(1L, request);
    }

    @Test
    void reponerStock_deberiaRetornarProductoConStockRepuesto() {
        StockRequest request = crearStockRequest(5);

        Producto productoActualizado = new Producto(
                "PROD-001",
                "Teclado Gamer",
                "Teclado mecánico RGB",
                15,
                new BigDecimal("29990")
        );

        when(productoService.reponerStock(1L, request)).thenReturn(productoActualizado);

        Producto resultado = productoController.reponerStock(1L, request);

        assertNotNull(resultado);
        assertEquals(15, resultado.getStock());

        verify(productoService).reponerStock(1L, request);
    }

    @Test
    void obtenerMovimientos_deberiaRetornarMovimientosDelProducto() {
        MovimientoInventario movimiento = new MovimientoInventario(
                1L,
                "PROD-001",
                TipoMovimiento.REGISTRO,
                10,
                10
        );

        when(productoService.obtenerMovimientos(1L)).thenReturn(List.of(movimiento));

        List<MovimientoInventario> resultado = productoController.obtenerMovimientos(1L);

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("PROD-001", resultado.get(0).getCodigoProducto());
        assertEquals(TipoMovimiento.REGISTRO, resultado.get(0).getTipoMovimiento());

        verify(productoService).obtenerMovimientos(1L);
    }

    @Test
    void home_deberiaRetornarInformacionDelServicio() {
        HomeController homeController = new HomeController();

        Map<String, String> respuesta = homeController.home();

        assertNotNull(respuesta);
        assertEquals("msInventario", respuesta.get("servicio"));
        assertEquals("Microservicio de inventario funcionando", respuesta.get("estado"));
        assertEquals("8081", respuesta.get("puerto"));
    }
}
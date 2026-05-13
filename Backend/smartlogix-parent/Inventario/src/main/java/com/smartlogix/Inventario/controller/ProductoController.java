package com.smartlogix.Inventario.controller;

import com.smartlogix.Inventario.dto.ProductoRequest;
import com.smartlogix.Inventario.dto.StockRequest;
import com.smartlogix.Inventario.model.MovimientoInventario;
import com.smartlogix.Inventario.model.Producto;
import com.smartlogix.Inventario.service.ProductoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 *
 * @author Gubier
 */

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public List<Producto> listarProductos() {
        return productoService.listarProductos();
    }

    @GetMapping("/{id}")
    public Producto buscarPorId(@PathVariable Long id) {
        return productoService.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Producto registrarProducto(@Valid @RequestBody ProductoRequest request) {
        return productoService.registrarProducto(request);
    }

    @PatchMapping("/{id}/stock")
    public Producto actualizarStock(@PathVariable Long id, @Valid @RequestBody StockRequest request) {
        return productoService.actualizarStock(id, request);
    }

    @PostMapping("/{id}/descontar-stock")
    public Producto descontarStock(@PathVariable Long id, @Valid @RequestBody StockRequest request) {
        return productoService.descontarStock(id, request);
    }

    @PostMapping("/{id}/reponer-stock")
    public Producto reponerStock(@PathVariable Long id, @Valid @RequestBody StockRequest request) {
        return productoService.reponerStock(id, request);
    }

    @GetMapping("/{id}/movimientos")
    public List<MovimientoInventario> obtenerMovimientos(@PathVariable Long id) {
        return productoService.obtenerMovimientos(id);
    }
}
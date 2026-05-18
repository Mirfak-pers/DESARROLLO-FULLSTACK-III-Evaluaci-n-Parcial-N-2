package com.smartlogix.Inventario.service;

import com.smartlogix.Inventario.dto.ProductoRequest;
import com.smartlogix.Inventario.dto.StockRequest;
import com.smartlogix.Inventario.exception.ProductoDuplicadoException;
import com.smartlogix.Inventario.exception.ProductoNoEncontradoException;
import com.smartlogix.Inventario.exception.StockInsuficienteException;
import com.smartlogix.Inventario.model.MovimientoInventario;
import com.smartlogix.Inventario.model.Producto;
import com.smartlogix.Inventario.model.TipoMovimiento;
import com.smartlogix.Inventario.repository.MovimientoInventarioRepository;
import com.smartlogix.Inventario.repository.ProductoRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author Gubier
 */

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final MovimientoInventarioRepository movimientoRepository;

    public ProductoService(ProductoRepository productoRepository,
                           MovimientoInventarioRepository movimientoRepository) {
        this.productoRepository = productoRepository;
        this.movimientoRepository = movimientoRepository;
    }

    public List<Producto> listarProductos() {
        return productoRepository.findAll();
    }

    public Producto buscarPorId(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new ProductoNoEncontradoException("Producto no encontrado con ID: " + id));
    }

    @Transactional
    public Producto registrarProducto(ProductoRequest request) {
        if (productoRepository.existsByCodigo(request.getCodigo())) {
            throw new ProductoDuplicadoException("Ya existe un producto con el código: " + request.getCodigo());
        }

        Producto producto = new Producto(
                request.getCodigo(),
                request.getNombre(),
                request.getDescripcion(),
                request.getPrecio(),
                request.getStock()
        );

        Producto guardado = productoRepository.save(producto);

        registrarMovimiento(guardado, TipoMovimiento.REGISTRO, request.getStock());

        return guardado;
    }

    @Transactional
    public Producto actualizarStock(Long id, StockRequest request) {
        Producto producto = buscarPorId(id);
        producto.setStock(request.getCantidad());

        Producto actualizado = productoRepository.save(producto);

        registrarMovimiento(actualizado, TipoMovimiento.ACTUALIZACION_MANUAL, request.getCantidad());

        return actualizado;
    }

    @Transactional
    public Producto descontarStock(Long id, StockRequest request) {
        Producto producto = buscarPorId(id);

        if (producto.getStock() < request.getCantidad()) {
            throw new StockInsuficienteException("Stock insuficiente para el producto: " + producto.getNombre());
        }

        producto.setStock(producto.getStock() - request.getCantidad());

        Producto actualizado = productoRepository.save(producto);

        registrarMovimiento(actualizado, TipoMovimiento.DESCUENTO, request.getCantidad());

        return actualizado;
    }

    @Transactional
    public Producto reponerStock(Long id, StockRequest request) {
        Producto producto = buscarPorId(id);

        producto.setStock(producto.getStock() + request.getCantidad());

        Producto actualizado = productoRepository.save(producto);

        registrarMovimiento(actualizado, TipoMovimiento.REPOSICION, request.getCantidad());

        return actualizado;
    }

    public List<MovimientoInventario> obtenerMovimientos(Long productoId) {
        buscarPorId(productoId);
        return movimientoRepository.findByProductoIdOrderByFechaMovimientoDesc(productoId);
    }

    private void registrarMovimiento(Producto producto, TipoMovimiento tipo, Integer cantidad) {
        MovimientoInventario movimiento = new MovimientoInventario(
                producto.getId(),
                producto.getCodigo(),
                tipo,
                cantidad,
                producto.getStock()
        );

        movimientoRepository.save(movimiento);
    }
}
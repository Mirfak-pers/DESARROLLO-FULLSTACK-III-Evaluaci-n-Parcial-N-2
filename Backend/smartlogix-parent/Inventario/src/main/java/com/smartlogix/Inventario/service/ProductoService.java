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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductoService {

    private static final Logger logger = LoggerFactory.getLogger(ProductoService.class);

    private final ProductoRepository productoRepository;
    private final MovimientoInventarioRepository movimientoRepository;

    public ProductoService(ProductoRepository productoRepository,
                           MovimientoInventarioRepository movimientoRepository) {
        this.productoRepository = productoRepository;
        this.movimientoRepository = movimientoRepository;
    }

    public List<Producto> listarProductos() {
        logger.info("Listando todos los productos");
        return productoRepository.findAll();
    }

    public Producto buscarPorId(Long id) {
        logger.info("Buscando producto ID: {}", id);
        return productoRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Producto no encontrado ID: {}", id);
                    return new ProductoNoEncontradoException("Producto no encontrado con ID: " + id);
                });
    }

    public Producto registrarProducto(ProductoRequest request) {
        logger.info("Registrando producto con código: {}", request.getCodigo());

        if (productoRepository.findByCodigo(request.getCodigo()).isPresent()) {
            logger.warn("Código duplicado: {}", request.getCodigo());
            throw new ProductoDuplicadoException("Ya existe un producto con código: " + request.getCodigo());
        }

        Producto producto = new Producto(
                request.getCodigo(),
                request.getNombre(),
                request.getDescripcion(),
                request.getStock(),
                request.getPrecio()
        );

        Producto guardado = productoRepository.save(producto);
        registrarMovimiento(guardado, request.getStock(), TipoMovimiento.REGISTRO);

        logger.info("Producto registrado con ID: {}", guardado.getId());
        return guardado;
    }

    public Producto actualizarStock(Long id, StockRequest request) {
        logger.info("Actualizando stock producto ID: {} a {}", id, request.getCantidad());

        Producto producto = buscarPorId(id);
        int stockAnterior = producto.getStock();

        producto.setStock(request.getCantidad());
        Producto actualizado = productoRepository.save(producto);

        int diff = Math.abs(request.getCantidad() - stockAnterior);
        registrarMovimiento(actualizado, diff, TipoMovimiento.ACTUALIZACION_MANUAL);

        return actualizado;
    }

    public Producto descontarStock(Long id, StockRequest request) {
        logger.info("Descontando stock producto ID: {} cantidad: {}", id, request.getCantidad());

        Producto producto = buscarPorId(id);

        if (producto.getStock() < request.getCantidad()) {
            logger.warn("Stock insuficiente para producto ID: {}", id);
            throw new StockInsuficienteException("Stock insuficiente para producto ID: " + id);
        }

        producto.setStock(producto.getStock() - request.getCantidad());
        Producto actualizado = productoRepository.save(producto);

        registrarMovimiento(actualizado, request.getCantidad(), TipoMovimiento.DESCUENTO);

        return actualizado;
    }

    public Producto reponerStock(Long id, StockRequest request) {
        logger.info("Reponiendo stock producto ID: {} cantidad: {}", id, request.getCantidad());

        Producto producto = buscarPorId(id);

        producto.setStock(producto.getStock() + request.getCantidad());
        Producto actualizado = productoRepository.save(producto);

        registrarMovimiento(actualizado, request.getCantidad(), TipoMovimiento.REPOSICION);

        return actualizado;
    }

    public List<MovimientoInventario> obtenerMovimientos(Long productoId) {
        buscarPorId(productoId);
        return movimientoRepository.findByProductoIdOrderByFechaMovimientoDesc(productoId);
    }

    private void registrarMovimiento(Producto producto, Integer cantidad, TipoMovimiento tipo) {
        MovimientoInventario mov = new MovimientoInventario(
                producto.getId(),
                producto.getCodigo(),
                tipo,
                cantidad,
                producto.getStock()
        );

        movimientoRepository.save(mov);
    }
}
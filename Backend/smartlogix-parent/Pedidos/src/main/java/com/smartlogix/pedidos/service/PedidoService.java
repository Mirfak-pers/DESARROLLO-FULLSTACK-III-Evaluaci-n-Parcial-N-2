package com.smartlogix.pedidos.service;

import com.smartlogix.pedidos.dto.CambiarEstadoRequest;
import com.smartlogix.pedidos.dto.DetallePedidoRequest;
import com.smartlogix.pedidos.dto.PedidoRequest;
import com.smartlogix.pedidos.dto.ProductoInventarioResponse;
import com.smartlogix.pedidos.dto.StockRequest;
import com.smartlogix.pedidos.exception.PedidoNoEncontradoException;
import com.smartlogix.pedidos.exception.PedidoVacioException;
import com.smartlogix.pedidos.exception.StockNoDisponibleException;
import com.smartlogix.pedidos.model.DetallePedido;
import com.smartlogix.pedidos.model.EstadoPedido;
import com.smartlogix.pedidos.model.Pedido;
import com.smartlogix.pedidos.repository.DetallePedidoRepository;
import com.smartlogix.pedidos.repository.PedidoRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final RestTemplate restTemplate;

    @Value("${inventario.service.url}")
    private String inventarioServiceUrl;

    public PedidoService(PedidoRepository pedidoRepository,
                         DetallePedidoRepository detallePedidoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.detallePedidoRepository = detallePedidoRepository;
        this.restTemplate = new RestTemplate();
    }

    public List<Pedido> listarPedidos() {
        return pedidoRepository.findAll();
    }

    public Pedido buscarPorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new PedidoNoEncontradoException("Pedido no encontrado con ID: " + id));
    }

    @Transactional
    public Pedido crearPedido(PedidoRequest request) {
        if (request.getDetalles() == null || request.getDetalles().isEmpty()) {
            throw new PedidoVacioException("No se puede crear un pedido vacío");
        }

        Pedido pedido = new Pedido(request.getCliente());

        for (DetallePedidoRequest detalleRequest : request.getDetalles()) {
            ProductoInventarioResponse producto = obtenerProductoInventario(detalleRequest.getProductoId());

            if (producto.getStock() < detalleRequest.getCantidad()) {
                throw new StockNoDisponibleException(
                        "Stock insuficiente para el producto: " + producto.getNombre()
                );
            }

            DetallePedido detalle = new DetallePedido(
                    producto.getId(),
                    producto.getCodigo(),
                    producto.getNombre(),
                    detalleRequest.getCantidad()
            );

            pedido.agregarDetalle(detalle);
        }

        pedido.setEstado(EstadoPedido.VALIDADO);

        return pedidoRepository.save(pedido);
    }

    @Transactional
    public Pedido cambiarEstado(Long id, CambiarEstadoRequest request) {
        Pedido pedido = buscarPorId(id);

        if (request.getEstado() == EstadoPedido.APROBADO) {
            validarYDescontarStock(pedido);
        }

        pedido.setEstado(request.getEstado());
        return pedidoRepository.save(pedido);
    }

    public List<DetallePedido> obtenerDetallePedido(Long pedidoId) {
        buscarPorId(pedidoId);
        return detallePedidoRepository.findByPedidoId(pedidoId);
    }

    private ProductoInventarioResponse obtenerProductoInventario(Long productoId) {
        try {
            return restTemplate.getForObject(
                    inventarioServiceUrl + "/" + productoId,
                    ProductoInventarioResponse.class
            );
        } catch (Exception ex) {
            throw new StockNoDisponibleException(
                    "No se pudo consultar el producto con ID: " + productoId + " en Inventario"
            );
        }
    }

    private void validarYDescontarStock(Pedido pedido) {
        for (DetallePedido detalle : pedido.getDetalles()) {
            ProductoInventarioResponse producto = obtenerProductoInventario(detalle.getProductoId());

            if (producto.getStock() < detalle.getCantidad()) {
                throw new StockNoDisponibleException(
                        "Stock insuficiente para aprobar el pedido. Producto: " + producto.getNombre()
                );
            }
        }

        for (DetallePedido detalle : pedido.getDetalles()) {
            restTemplate.postForObject(
                    inventarioServiceUrl + "/" + detalle.getProductoId() + "/descontar-stock",
                    new StockRequest(detalle.getCantidad()),
                    ProductoInventarioResponse.class
            );
        }
    }
}
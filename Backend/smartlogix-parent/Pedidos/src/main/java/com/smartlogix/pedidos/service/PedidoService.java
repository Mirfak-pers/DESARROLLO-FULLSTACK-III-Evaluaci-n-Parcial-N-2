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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class PedidoService {

    private static final Logger logger =
            LoggerFactory.getLogger(PedidoService.class);

    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final RestTemplate restTemplate;

    @Value("${servicios.inventario.url:http://localhost:8081/api/inventario/productos}")
    private String inventarioServiceUrl;

    public PedidoService(PedidoRepository pedidoRepository,
                         DetallePedidoRepository detallePedidoRepository,
                         RestTemplate restTemplate) {
        this.pedidoRepository = pedidoRepository;
        this.detallePedidoRepository = detallePedidoRepository;
        this.restTemplate = restTemplate;
    }

    // ==========================
    // LISTAR PEDIDOS
    // ==========================
    public List<Pedido> listarPedidos() {
        logger.info("Listando todos los pedidos");
        return pedidoRepository.findAll();
    }

    // ==========================
    // BUSCAR POR ID
    // ==========================
    public Pedido buscarPorId(Long id) {

        logger.info("Buscando pedido ID: {}", id);

        return pedidoRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Pedido no encontrado ID: {}", id);
                    return new PedidoNoEncontradoException(
                            "Pedido no encontrado con ID: " + id
                    );
                });
    }

    // ==========================
    // CREAR PEDIDO
    // ==========================
    public Pedido crearPedido(PedidoRequest request) {

        logger.info("Creando pedido para cliente: {}",
                request.getCliente());

        if (request.getDetalles() == null ||
                request.getDetalles().isEmpty()) {

            logger.warn("Intento de crear pedido vacío");

            throw new PedidoVacioException(
                    "No se puede crear un pedido vacío"
            );
        }

        Pedido pedido = new Pedido(request.getCliente());
        pedido.setEstado(EstadoPedido.CREADO);

        for (DetallePedidoRequest detalleRequest :
                request.getDetalles()) {

            logger.info(
                    "Validando producto ID {} cantidad {}",
                    detalleRequest.getProductoId(),
                    detalleRequest.getCantidad()
            );

            ProductoInventarioResponse producto =
                    obtenerProductoInventario(
                            detalleRequest.getProductoId()
                    );

            if (producto.getStock() == null ||
                    producto.getStock()
                            < detalleRequest.getCantidad()) {

                logger.warn(
                        "Stock insuficiente para producto ID {}",
                        detalleRequest.getProductoId()
                );

                throw new StockNoDisponibleException(
                        "Stock insuficiente para el producto ID: "
                                + detalleRequest.getProductoId()
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

        Pedido guardado = pedidoRepository.save(pedido);

        logger.info(
                "Pedido creado correctamente ID: {}",
                guardado.getId()
        );

        validarYDescontarStock(guardado);

        guardado.setEstado(EstadoPedido.VALIDADO);

        logger.info(
                "Pedido validado correctamente ID: {}",
                guardado.getId()
        );

        return pedidoRepository.save(guardado);
    }

    // ==========================
    // CAMBIAR ESTADO
    // ==========================
    public Pedido cambiarEstado(Long id,
                                CambiarEstadoRequest request) {

        logger.info(
                "Cambiando estado del pedido ID {} a {}",
                id,
                request.getEstado()
        );

        Pedido pedido = buscarPorId(id);

        pedido.setEstado(request.getEstado());

        Pedido actualizado =
                pedidoRepository.save(pedido);

        logger.info(
                "Estado actualizado correctamente para pedido {}",
                id
        );

        return actualizado;
    }

    // ==========================
    // DETALLES
    // ==========================
    public List<DetallePedido> obtenerDetallePedido(
            Long pedidoId) {

        logger.info(
                "Consultando detalles del pedido ID {}",
                pedidoId
        );

        buscarPorId(pedidoId);

        return detallePedidoRepository
                .findByPedidoId(pedidoId);
    }

    // ==========================
    // CONSULTA INVENTARIO
    // ==========================
    private ProductoInventarioResponse
    obtenerProductoInventario(Long productoId) {

        logger.debug(
                "Consultando inventario producto ID {}",
                productoId
        );

        try {
            return restTemplate.getForObject(
                    inventarioServiceUrl + "/" + productoId,
                    ProductoInventarioResponse.class
            );

        } catch (Exception ex) {

            logger.error(
                    "Error consultando inventario producto {}",
                    productoId
            );

            throw new StockNoDisponibleException(
                    "No se pudo consultar inventario para producto ID: "
                            + productoId
            );
        }
    }

    // ==========================
    // DESCONTAR STOCK
    // ==========================
    private void validarYDescontarStock(Pedido pedido) {

        for (DetallePedido detalle :
                pedido.getDetalles()) {

            logger.info(
                    "Descontando stock producto {} cantidad {}",
                    detalle.getProductoId(),
                    detalle.getCantidad()
            );

            try {

                restTemplate.postForObject(
                        inventarioServiceUrl + "/"
                                + detalle.getProductoId()
                                + "/descontar-stock",

                        new StockRequest(
                                detalle.getCantidad()
                        ),

                        Object.class
                );

            } catch (Exception ex) {

                logger.error(
                        "Error descontando stock producto {}",
                        detalle.getProductoId()
                );

                throw new StockNoDisponibleException(
                        "No se pudo descontar stock del producto ID: "
                                + detalle.getProductoId()
                );
            }
        }
    }
}
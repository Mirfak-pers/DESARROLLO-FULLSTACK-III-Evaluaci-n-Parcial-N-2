package com.smartlogix.pedidos.controller;

import com.smartlogix.pedidos.dto.CambiarEstadoRequest;
import com.smartlogix.pedidos.dto.PedidoRequest;
import com.smartlogix.pedidos.model.DetallePedido;
import com.smartlogix.pedidos.model.Pedido;
import com.smartlogix.pedidos.service.PedidoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @GetMapping
    public List<Pedido> listarPedidos() {
        return pedidoService.listarPedidos();
    }

    @GetMapping("/{id}")
    public Pedido buscarPorId(@PathVariable Long id) {
        return pedidoService.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Pedido crearPedido(@Valid @RequestBody PedidoRequest request) {
        return pedidoService.crearPedido(request);
    }

    @PatchMapping("/{id}/estado")
    public Pedido cambiarEstado(@PathVariable Long id, @Valid @RequestBody CambiarEstadoRequest request) {
        return pedidoService.cambiarEstado(id, request);
    }

    @GetMapping("/{id}/detalle")
    public List<DetallePedido> obtenerDetallePedido(@PathVariable Long id) {
        return pedidoService.obtenerDetallePedido(id);
    }
}
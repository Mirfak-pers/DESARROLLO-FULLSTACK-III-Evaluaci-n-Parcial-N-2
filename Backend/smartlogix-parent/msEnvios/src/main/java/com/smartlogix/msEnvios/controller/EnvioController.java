package com.smartlogix.msEnvios.controller;

import com.smartlogix.msEnvios.dto.CambiarEstadoRequest;
import com.smartlogix.msEnvios.dto.EnvioRequest;
import com.smartlogix.msEnvios.model.Envio;
import com.smartlogix.msEnvios.model.EstadoEnvio;
import com.smartlogix.msEnvios.service.EnvioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/envios")
public class EnvioController {

    private final EnvioService envioService;

    public EnvioController(EnvioService envioService) {
        this.envioService = envioService;
    }

    // POST /api/envios → Crear envío
    @PostMapping
    public ResponseEntity<Envio> crearEnvio(@Valid @RequestBody EnvioRequest request) {
        Envio envio = envioService.crearEnvio(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(envio);
    }

    // GET /api/envios → Listar todos
    @GetMapping
    public ResponseEntity<List<Envio>> listarTodos() {
        return ResponseEntity.ok(envioService.listarTodos());
    }

    // GET /api/envios/{id} → Buscar por ID
    @GetMapping("/{id}")
    public ResponseEntity<Envio> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(envioService.buscarPorId(id));
    }

    // GET /api/envios/seguimiento/{numero} → Rastrear por número de seguimiento
    @GetMapping("/seguimiento/{numero}")
    public ResponseEntity<Envio> buscarPorSeguimiento(@PathVariable String numero) {
        return ResponseEntity.ok(envioService.buscarPorSeguimiento(numero));
    }

    // GET /api/envios/usuario/{usuarioId} → Envíos de un usuario
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Envio>> buscarPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(envioService.buscarPorUsuario(usuarioId));
    }

    // GET /api/envios/pedido/{pedidoId} → Envíos de un pedido
    @GetMapping("/pedido/{pedidoId}")
    public ResponseEntity<List<Envio>> buscarPorPedido(@PathVariable Long pedidoId) {
        return ResponseEntity.ok(envioService.buscarPorPedido(pedidoId));
    }

    // GET /api/envios/estado/{estado} → Filtrar por estado
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Envio>> buscarPorEstado(@PathVariable EstadoEnvio estado) {
        return ResponseEntity.ok(envioService.buscarPorEstado(estado));
    }

    // PATCH /api/envios/{id}/estado → Cambiar estado
    @PatchMapping("/{id}/estado")
    public ResponseEntity<Envio> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody CambiarEstadoRequest request) {
        return ResponseEntity.ok(envioService.cambiarEstado(id, request));
    }

    // DELETE /api/envios/{id} → Eliminar envío
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarEnvio(@PathVariable Long id) {
        envioService.eliminarEnvio(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/envios/home → Health check
    @GetMapping("/home")
    public ResponseEntity<String> home() {
        return ResponseEntity.ok("Microservicio de Envíos activo ✓");
    }
}

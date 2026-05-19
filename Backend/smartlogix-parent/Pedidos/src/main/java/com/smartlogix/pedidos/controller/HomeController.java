package com.smartlogix.pedidos.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class HomeController {
    @GetMapping("/")
    public Map<String, String> home() {
        return Map.of(
                "servicio", "msPedidos",
                "estado", "OK",
                "api", "/api/pedidos",
                "swagger", "/swagger-ui.html",
                "health", "/actuator/health"
        );
    }
}

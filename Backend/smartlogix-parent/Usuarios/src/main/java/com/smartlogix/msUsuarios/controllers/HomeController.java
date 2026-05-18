package com.smartlogix.msUsuarios.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class HomeController {
    @GetMapping("/")
    public Map<String, String> home() {
        return Map.of(
                "servicio", "msUsuarios",
                "estado", "OK",
                "api", "/api/usuarios",
                "swagger", "/swagger-ui.html",
                "health", "/actuator/health"
        );
    }
}

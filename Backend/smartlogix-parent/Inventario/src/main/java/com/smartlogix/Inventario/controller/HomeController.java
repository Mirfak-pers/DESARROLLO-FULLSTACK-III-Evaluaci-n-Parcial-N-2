package com.smartlogix.Inventario.controller;

import java.util.HashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, String> home() {
        Map<String, String> respuesta = new HashMap<>();
        respuesta.put("servicio", "msInventario");
        respuesta.put("estado", "Microservicio de inventario funcionando");
        respuesta.put("puerto", "8081");
        return respuesta;
    }
}
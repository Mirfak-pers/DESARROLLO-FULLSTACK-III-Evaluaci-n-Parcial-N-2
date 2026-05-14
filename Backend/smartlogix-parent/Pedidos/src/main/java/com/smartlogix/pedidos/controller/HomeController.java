package com.smartlogix.pedidos.controller;

import java.util.HashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, String> home() {
        Map<String, String> respuesta = new HashMap<>();
        respuesta.put("servicio", "msPedidos");
        respuesta.put("estado", "Microservicio de pedidos funcionando");
        respuesta.put("puerto", "8082");
        return respuesta;
    }
}
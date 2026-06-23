package com.smartlogix.bff;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
        "eureka.client.enabled=false",
        "eureka.client.register-with-eureka=false",
        "eureka.client.fetch-registry=false",
        "spring.cloud.discovery.enabled=false",
        "smartlogix.services.inventario.url=http://localhost:8081/api/inventario/productos",
        "smartlogix.services.pedidos.url=http://localhost:8082/api/pedidos",
        "smartlogix.services.envios.url=http://localhost:8083/api/envios",
        "smartlogix.services.usuarios.url=http://localhost:8084/api/usuarios"
})
class BffApplicationTests {

    @Test
    void contextLoads() {
    }
}
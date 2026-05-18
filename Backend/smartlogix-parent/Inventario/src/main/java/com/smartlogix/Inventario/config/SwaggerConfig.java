package com.smartlogix.Inventario.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI inventarioOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Microservicio de Inventario - SmartLogix")
                        .description("API REST para gestión de productos, stock y movimientos de inventario.")
                        .version("1.0.0"));
    }
}

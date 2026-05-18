package com.smartlogix.pedidos.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI pedidosOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Microservicio de Pedidos - SmartLogix")
                        .description("API REST para creación, validación y seguimiento de pedidos.")
                        .version("1.0.0"));
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

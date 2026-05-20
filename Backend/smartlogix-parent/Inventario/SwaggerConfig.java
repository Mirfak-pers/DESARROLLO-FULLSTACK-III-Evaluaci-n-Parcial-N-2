package com.smartlogix.Inventario.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de Swagger / OpenAPI para msInventario.
 *
 * Agrega el esquema de seguridad "Bearer Token (JWT)" para que el botón
 * "Authorize" aparezca en la UI y permita ejecutar endpoints protegidos
 * directamente desde Swagger sin recibir 403.
 *
 * Cómo usar en Swagger UI:
 *   1. Obtén un token de Keycloak (ver README).
 *   2. Haz clic en "Authorize" (candado).
 *   3. Pega el token en el campo Value con el formato: Bearer <token>
 *   4. Haz clic en "Authorize" y cierra el diálogo.
 *   5. Ya puedes ejecutar POST / PATCH / etc. desde la UI.
 */
@Configuration
public class SwaggerConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI inventarioOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Microservicio de Inventario — SmartLogix")
                        .description(
                                "API REST para gestión de productos, stock y movimientos de inventario.\n\n"
                                + "**Autenticación:** usa el botón 🔒 Authorize e ingresa tu JWT de Keycloak "
                                + "con el formato `Bearer <token>`.")
                        .version("1.0.0"))
                // Declara el esquema de seguridad global
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, new SecurityScheme()
                                .name(SECURITY_SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Token JWT emitido por Keycloak. Formato: Bearer <token>")))
                // Aplica el esquema a todos los endpoints
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME));
    }
}

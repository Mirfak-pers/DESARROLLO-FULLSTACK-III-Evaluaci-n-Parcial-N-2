# Integración con Keycloak — SmartLogix

## ¿Qué es Keycloak?

Keycloak es un servidor de autenticación y autorización open source (IAM).
Centraliza el login, manejo de usuarios, roles y emisión de tokens JWT para todos los microservicios.

---

## Configuración inicial en Keycloak

1. Levantar con Docker:
   ```bash
   docker compose up keycloak
   ```

2. Ingresar a http://localhost:8080 → admin / admin

3. Crear un **Realm**: `smartlogix`

4. Crear un **Client**:
   - Client ID: `smartlogix-app`
   - Client authentication: ON (confidential)
   - Valid redirect URIs: `http://localhost:*`

5. Crear **Roles** en el Realm:
   - `ADMIN`
   - `USER`

6. Crear un **usuario de prueba** y asignarle un rol.

---

## Obtener un token JWT

```bash
curl -X POST http://localhost:8080/realms/smartlogix/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=smartlogix-app" \
  -d "client_secret=TU_SECRET" \
  -d "username=usuario" \
  -d "password=contraseña"
```

Respuesta:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiJ9...",
  "token_type": "Bearer",
  "expires_in": 300
}
```

---

## Usar el token en los microservicios

Agregar el header en cada request:
```
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...
```

En Swagger UI: clic en "Authorize" → pegar el token.

---

## Cambios realizados al proyecto

| Archivo | Cambio |
|---|---|
| `*/pom.xml` | Agregada dependencia `spring-boot-starter-oauth2-resource-server` |
| `*/application.properties` | Agregado `spring.security.oauth2.resourceserver.jwt.issuer-uri` |
| `Usuarios/security/SecurityConfig.java` | Reemplazado BCrypt-only por validación JWT de Keycloak |
| `Inventario/config/SecurityConfig.java` | Nuevo — protege endpoints con JWT |
| `Pedidos/config/SecurityConfig.java` | Nuevo — protege endpoints con JWT |
| `msEnvios/config/SecurityConfig.java` | Nuevo — protege endpoints con JWT |
| `docker-compose.yml` | Nuevo — incluye Keycloak y todos los servicios |

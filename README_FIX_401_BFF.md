# Fix 401 entre Frontend, Keycloak y BFF

Este ajuste mantiene Keycloak como login obligatorio para el frontend y protege el BFF con token JWT.

Cambio clave:

- El frontend manda `Authorization: Bearer <token>` al BFF.
- El BFF valida ese token contra Keycloak.
- El BFF llama a Inventario, Pedidos y Envios como servicios internos, sin reenviar el token al microservicio.

Esto evita el error donde el frontend inicia sesión correctamente, pero luego una llamada interna devuelve `401 Unauthorized` y la app parece regresar al login.

Endpoint para probar token en el BFF:

```txt
http://localhost:8083/api/bff/auth/me
```

Debe responder datos del usuario logueado y roles.

Si `/api/bff/auth/me` devuelve 401, el problema está entre frontend y BFF.
Si `/api/bff/auth/me` responde OK pero `/api/bff/productos` devuelve 401, el problema venía de los microservicios internos. Este ZIP ya corrige eso al no reenviar el token.

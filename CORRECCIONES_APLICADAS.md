# Correcciones Aplicadas - SmartLogix

## 🔴 Errores Críticos Corregidos

### 1. Campo `precio` faltante en Inventario
- **Problema**: `Producto.java` y `ProductoRequest.java` no tenían campo `precio`, pero el frontend (`Inventario.jsx`) lo enviaba y mostraba.
- **Fix**: Agregado `BigDecimal precio` en el modelo `Producto`, `ProductoRequest` y `ProductoInventarioResponse` (msPedidos).

### 2. Puerto incorrecto en msEnvios
- **Problema**: `application.properties` de msEnvios tenía `server.port=8085`, pero `docker-compose.yml` mapeaba `8083:8083`.
- **Fix**: Puerto corregido a `8083`.

### 3. Frontend apuntaba a BFF inexistente
- **Problema**: `apiClient.js` usaba `baseURL: "http://localhost:8080/api/bff"` — ese BFF no existe en el proyecto.
- **Fix**: `baseURL` cambiado a `/api`, con proxy configurado en `vite.config.js` para desarrollo y nginx para producción Docker.

### 4. Rutas de servicios frontend incorrectas
- **Problema**: `inventarioService.js` llamaba a `/productos` (debería ser `/inventario/productos`); `pedidosService.js` llamaba a `POST /pedidos/{id}/aprobar` que no existe en el backend.
- **Fix**: Rutas corregidas. `aprobarPedido` ahora usa `PATCH /pedidos/{id}/estado` con body `{ estado: "APROBADO" }`.

### 5. Mismatch en nombre del campo detalles/items en Pedidos
- **Problema**: El frontend enviaba `{ items: [...] }` pero el backend esperaba `{ detalles: [...] }`.
- **Fix**: `pedidosService.js` normaliza automáticamente antes de enviar.

### 6. Bean `RestTemplate` faltante en msPedidos
- **Problema**: `InventarioClientService` inyectaba `RestTemplate` pero no había un `@Bean` que lo provea.
- **Fix**: Creado `AppConfig.java` con `@Bean RestTemplate`.

### 7. Dockerfiles inexistentes
- **Problema**: `docker-compose.yml` hacía `build:` a todos los servicios pero ninguno tenía `Dockerfile`.
- **Fix**: Creados `Dockerfile` para todos los microservicios (multi-stage con Maven) y para el frontend (Node build + Nginx).

### 8. Base de datos MySQL no declarada en docker-compose
- **Problema**: Los microservicios dependían de MySQL pero no había servicios MySQL en `docker-compose.yml`.
- **Fix**: Agregados 4 servicios MySQL (uno por microservicio), con healthchecks y `depends_on`.

### 9. URLs de Eureka y Keycloak hardcodeadas para localhost
- **Problema**: Dentro de Docker los servicios no pueden llegar a `localhost:8761` ni `localhost:8080`.
- **Fix**: Todas las URLs ahora usan variables de entorno (`${EUREKA_URL}`, `${KEYCLOAK_URL}`) inyectadas desde `docker-compose.yml`.

### 10. nginx.conf faltante para el frontend
- **Problema**: No había configuración de Nginx para el contenedor del frontend.
- **Fix**: Creado `nginx.conf` con proxy a cada microservicio y soporte para React Router.

## ✅ Funcionalidades Confirmadas

| Feature | Estado |
|---------|--------|
| Keycloak (OAuth2 JWT) | ✅ Configurado en todos los MS |
| Eureka (Service Discovery) | ✅ Todos los MS registrados |
| Circuit Breaker (Resilience4j) | ✅ En msPedidos → msInventario |
| Logs (archivo + consola) | ✅ En todos los MS |
| Precio en Inventario | ✅ Corregido |
| Docker Compose completo | ✅ Con MySQL, healthchecks |

## 🚀 Instrucciones de Arranque

```bash
# 1. Iniciar todo con Docker Compose
docker-compose up -d

# 2. Configurar Keycloak (una sola vez):
#    - Abrir http://localhost:8080
#    - Login: admin / admin
#    - Crear realm "smartlogix"
#    - Crear client "smartlogix-frontend" (public, con redirect a http://localhost:3000/*)
#    - Crear roles: USER, ADMIN
#    - Crear usuario de prueba

# 3. Frontend disponible en http://localhost:3000
# 4. Eureka dashboard en http://localhost:8761
```

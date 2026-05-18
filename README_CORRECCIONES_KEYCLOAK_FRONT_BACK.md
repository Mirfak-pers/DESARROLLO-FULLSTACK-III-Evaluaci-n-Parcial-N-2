# Correcciones de integración Frontend + Backend + Keycloak

## Cambios aplicados

### 1. Frontend con login Keycloak
- Se agregó `keycloak-js` al `package.json`.
- Se creó `src/auth/keycloak.js` con la configuración del realm `smartlogix` y cliente `smartlogix-app`.
- Se creó `AuthContext.jsx` para inicializar Keycloak y manejar sesión.
- Se creó `ProtectedRoute.jsx` para impedir el acceso al sistema si el usuario no inicia sesión.
- Se modificó `apiClient.js` para enviar el token JWT en cada llamada al BFF:

```txt
Authorization: Bearer <token>
```

### 2. Backend/BFF protegido con Keycloak
- Se agregó seguridad OAuth2 Resource Server al BFF.
- Los endpoints `/api/bff/**` ahora requieren token JWT válido.
- El BFF reenvía el token a Inventario, Pedidos y Envíos.

### 3. Inventario con columna precio
- Se agregó el campo `precio` a la entidad `Producto`.
- Se agregó `precio` al DTO `ProductoRequest`.
- Se validó que el precio sea obligatorio y mayor a 0.
- El BFF ahora envía el precio al microservicio Inventario.

### 4. Pedidos sin mostrar ID de productos al usuario
- El formulario de Pedidos ahora muestra un selector de productos por nombre, stock y precio.
- Internamente sigue enviando `productoId` al backend, pero el usuario no tiene que escribir ni ver el ID del producto.
- La tabla de pedidos muestra el nombre del producto y cantidad.

### 5. Envíos mostrando ID de pedidos
- El formulario de Envíos ahora carga los pedidos aprobados.
- El usuario selecciona explícitamente el `Pedido ID` aprobado para generar el envío.
- La tabla de envíos muestra la columna `ID Pedido`.

## Configuración esperada de Keycloak

En Keycloak debe existir:

- Realm: `smartlogix`
- Cliente: `smartlogix-app`
- Tipo de cliente: público para el frontend React
- Valid redirect URI:

```txt
http://localhost:5173/*
```

- Web origins:

```txt
http://localhost:5173
```

Roles recomendados:

```txt
admin
estudiante
docente
```

## Puertos recomendados

```txt
Keycloak:    http://localhost:8080
Eureka:      http://localhost:8761
Inventario:  http://localhost:8081
Pedidos:     http://localhost:8082
BFF:         http://localhost:8083
Usuarios:    http://localhost:8084
Envíos:      http://localhost:8085
Frontend:    http://localhost:5173
```

## Orden de ejecución recomendado

1. Keycloak
2. Eureka
3. Inventario
4. Pedidos
5. Envíos
6. BFF
7. Frontend

## Frontend

```bash
cd Frontend/smartlogix-frontend
npm install
npm run dev
```

Si tu cliente Keycloak usa otro nombre, crea un archivo `.env` en `Frontend/smartlogix-frontend`:

```env
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=smartlogix
VITE_KEYCLOAK_CLIENT_ID=smartlogix-app
VITE_BFF_URL=http://localhost:8083/api/bff
```

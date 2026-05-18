# SmartLogix — Plataforma de Gestión Logística

Proyecto de arquitectura de microservicios desarrollado para la **Evaluación Parcial N°2** de la asignatura **Desarrollo Fullstack III**.

---

## Descripción general

SmartLogix es una plataforma orientada a la gestión logística para eCommerce. Está construida con una arquitectura de microservicios en Java/Spring Boot, con autenticación centralizada mediante **Keycloak**.

---

## Microservicios

| Microservicio | Puerto | Descripción |
|---|---|---|
| **Eureka** | 8761 | Service Registry — registro y descubrimiento de servicios |
| **ms-Inventario** | 8081 | Gestión de productos y stock |
| **ms-Pedidos** | 8082 | Creación y seguimiento de pedidos |
| **ms-Envios** | 8083 | Gestión de envíos |
| **ms-Usuarios** | 8084 | Gestión de usuarios |
| **Keycloak** | 8080 | Servidor de autenticación y autorización (JWT) |

---

## Tecnologías utilizadas

- Java 17
- Spring Boot 3.3.5
- Spring Security + OAuth2 Resource Server
- Spring Data JPA
- Spring Cloud Netflix Eureka
- Resilience4j (Circuit Breaker)
- MySQL
- Keycloak 24.0.1
- Docker / Docker Compose
- Swagger / OpenAPI (springdoc)
- Maven

---

## Requisitos previos

- Java 17+
- Maven
- MySQL corriendo localmente
- Docker Desktop instalado y corriendo

---

## 1. Levantar Keycloak

Keycloak se levanta con Docker. Desde la raíz del proyecto:

```bash
docker compose up keycloak
```

> Si tienes problemas con variables de entorno, asegúrate que el `docker-compose.yml` tenga:
> ```yaml
> environment:
>   KEYCLOAK_ADMIN: admin
>   KEYCLOAK_ADMIN_PASSWORD: admin
> ```
> **No uses** `KC_BOOTSTRAP_ADMIN_USERNAME` — esas variables son de versiones más nuevas y no funcionan en Keycloak 24.

---

## 2. Configurar Keycloak

Ingresa a `http://localhost:8080` con usuario `admin` / contraseña `admin`.

### 2.1 Crear el Realm

1. Clic en el dropdown `Keycloak` (esquina superior izquierda)
2. Clic en **Create realm**
3. Realm name: `smartlogix`
4. Clic en **Create**

### 2.2 Configurar Login settings

Dentro del realm `smartlogix` → **Realm settings** → pestaña **Login**:

| Opción | Valor |
|---|---|
| Email as username | **OFF** |
| Login with email | **OFF** |
| Verify email | **OFF** |

Clic en **Save**.

### 2.3 Crear Roles

Ve a **Realm roles** → **Create role**:

- Crear rol: `ADMIN`
- Crear rol: `USER`

### 2.4 Crear el Client

Ve a **Clients** → **Create client**:

**General settings:**
- Client ID: `smartlogix-app`
- Clic en **Next**

**Capability config:**
- Client authentication: **ON**
- Authorization: **ON**
- Direct access grants: **ON** ← importante para pedir tokens por API
- Clic en **Next**

**Login settings:**
- Valid redirect URIs: `http://localhost:*`
- Valid post logout redirect URIs: `http://localhost:*`
- Web origins: `*`
- Clic en **Save**

Luego ve a la pestaña **Credentials** y copia el **Client secret**.

### 2.5 Crear usuario de prueba

Ve a **Users** → **Create user**:

| Campo | Valor |
|---|---|
| Username | `testuser` |
| Email | `testuser@test.com` |
| First name | `Test` |
| Last name | `User` |
| Email verified | **ON** |
| Required user actions | **(vacío)** |

Clic en **Create**.

Luego en la pestaña **Credentials**:
- Clic en **Set password**
- Password: `Test1234`
- Temporary: **OFF**
- Clic en **Save password**

Luego en la pestaña **Role mapping**:
- Clic en **Assign role**
- Selecciona `USER` y `ADMIN`
- Clic en **Assign**

---

## 3. Configurar bases de datos MySQL

Cada microservicio usa su propia base de datos. Crea las bases antes de levantar los servicios:

```sql
CREATE DATABASE smartlogix_inventario;
CREATE DATABASE smartlogix_pedidos;
CREATE DATABASE smartlogix_envios;
CREATE DATABASE db_smartlogix_usuarios;
```

Las credenciales se configuran en el archivo `.env` o directamente en `application.properties` de cada microservicio.

---

## 4. Levantar los microservicios

Levanta en este orden:

```bash
# 1. Eureka primero
cd Backend/smartlogix-parent/Eureka
mvn spring-boot:run

# 2. Luego los demás (en terminales separadas)
cd Backend/smartlogix-parent/Inventario
mvn spring-boot:run

cd Backend/smartlogix-parent/Pedidos
mvn spring-boot:run

cd Backend/smartlogix-parent/msEnvios
mvn spring-boot:run

cd Backend/smartlogix-parent/Usuarios
mvn spring-boot:run
```

Verifica que todos estén registrados en Eureka: `http://localhost:8761`

---

## 5. Obtener token JWT

### PowerShell

```powershell
$token = (Invoke-RestMethod -Method Post `
  -Uri "http://localhost:8080/realms/smartlogix/protocol/openid-connect/token" `
  -ContentType "application/x-www-form-urlencoded" `
  -Body @{
    grant_type    = "password"
    client_id     = "smartlogix-app"
    client_secret = "9TnQIoXZUesSG9sFcSqKeTt2dsfVpOLn"
    username      = "testuser"
    password      = "Test1234"
  }).access_token
```

### CMD / Bash

```bash
curl -X POST "http://localhost:8080/realms/smartlogix/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=smartlogix-app&client_secret=TU_CLIENT_SECRET&username=testuser&password=Test1234"
```

---

## 6. Consumir los microservicios con el token

### PowerShell

```powershell
# Usuarios
Invoke-RestMethod -Uri "http://localhost:8084/api/usuarios" `
  -Headers @{ Authorization = "Bearer $token" }

# Inventario
Invoke-RestMethod -Uri "http://localhost:8081/api/inventario/productos" `
  -Headers @{ Authorization = "Bearer $token" }

# Pedidos
Invoke-RestMethod -Uri "http://localhost:8082/api/pedidos" `
  -Headers @{ Authorization = "Bearer $token" }

# Envios
Invoke-RestMethod -Uri "http://localhost:8083/api/envios" `
  -Headers @{ Authorization = "Bearer $token" }
```

### CMD / Bash

```bash
curl -H "Authorization: Bearer TU_TOKEN" http://localhost:8084/api/usuarios
```

---

## 7. Swagger UI

Cada microservicio expone su documentación en:

| Microservicio | URL Swagger |
|---|---|
| Inventario | http://localhost:8081/swagger-ui.html |
| Pedidos | http://localhost:8082/swagger-ui.html |
| Envios | http://localhost:8083/swagger-ui.html |
| Usuarios | http://localhost:8084/swagger-ui.html |

Para autenticarte en Swagger: clic en **Authorize** → pegar el token con el formato `Bearer eyJhbGci...`

---

## 8. Flujo de autenticación

```
Usuario
  │
  ▼
Keycloak (puerto 8080)
  │  emite JWT con roles [ADMIN, USER]
  ▼
Microservicio (8081 / 8082 / 8083 / 8084)
  │  valida JWT contra Keycloak
  │  lee roles del claim realm_access.roles
  ▼
Responde según permisos
```

---

## 9. Cambios realizados para integrar Keycloak

| Archivo | Cambio |
|---|---|
| `*/pom.xml` | Agregada dependencia `spring-boot-starter-oauth2-resource-server` |
| `*/application.properties` | Agregado `spring.security.oauth2.resourceserver.jwt.issuer-uri` |
| `Usuarios/security/SecurityConfig.java` | Actualizado con validación JWT + BCryptPasswordEncoder |
| `Inventario/config/SecurityConfig.java` | Nuevo — protege endpoints con JWT |
| `Pedidos/config/SecurityConfig.java` | Nuevo — protege endpoints con JWT |
| `msEnvios/config/SecurityConfig.java` | Nuevo — protege endpoints con JWT |
| `docker-compose.yml` | Nuevo — incluye Keycloak y todos los servicios |

---

## 10. Roles y permisos

| Rol | Permisos |
|---|---|
| `USER` | GET — consultar recursos |
| `ADMIN` | GET + POST + PUT + DELETE — gestión completa |

Los endpoints públicos (sin token) son: `/actuator/**`, `/swagger-ui/**`, `/v3/api-docs/**`
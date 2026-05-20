# SmartLogix — Plataforma de Gestión Logística

> Proyecto de arquitectura de microservicios desarrollado para la **Evaluación Parcial N°2** de la asignatura **Desarrollo Fullstack III**.

---

## Descripción general

SmartLogix es una plataforma orientada a la gestión logística para eCommerce. Está construida sobre una arquitectura de microservicios en Java/Spring Boot, con autenticación centralizada mediante **Keycloak** (OAuth2 + JWT), registro de servicios con **Eureka** y resiliencia mediante **Resilience4j**.

---

## Tabla de contenidos

1. [Arquitectura y microservicios](#1-arquitectura-y-microservicios)
2. [Tecnologías utilizadas](#2-tecnologías-utilizadas)
3. [Requisitos previos](#3-requisitos-previos)
4. [Configuración de bases de datos](#4-configuración-de-bases-de-datos)
5. [Configuración de Keycloak](#5-configuración-de-keycloak)
6. [Levantar los microservicios](#6-levantar-los-microservicios)
7. [Levantar con Docker Compose](#7-levantar-con-docker-compose)
8. [Obtener token JWT](#8-obtener-token-jwt)
9. [Consumir los microservicios](#9-consumir-los-microservicios)
10. [Documentación Swagger](#10-documentación-swagger)
11. [Health checks](#11-health-checks)
12. [Roles y permisos](#12-roles-y-permisos)
13. [Flujo de autenticación](#13-flujo-de-autenticación)

---

## 1. Arquitectura y microservicios

| Microservicio | Puerto | Descripción |
|---|---|---|
| **Eureka** | 8761 | Service Registry — registro y descubrimiento de servicios |
| **ms-Inventario** | 8081 | Gestión de productos y stock |
| **ms-Pedidos** | 8082 | Creación y seguimiento de pedidos |
| **ms-Envios** | 8083 | Gestión de envíos |
| **ms-Usuarios** | 8084 | Gestión de usuarios |
| **Keycloak** | 8080 | Servidor de autenticación y autorización (JWT) |
| **Frontend** | 3000 | Interfaz web (React + Vite) |

### APIs principales

| Microservicio | Endpoint base |
|---|---|
| Inventario | `http://localhost:8081/api/inventario/productos` |
| Pedidos | `http://localhost:8082/api/pedidos` |
| Usuarios | `http://localhost:8084/api/usuarios` |
| Envíos | `http://localhost:8083/api/envios` |

---

## 2. Tecnologías utilizadas

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
- React + Vite (frontend)
- Nginx (producción frontend)

---

## 3. Requisitos previos

- Java 17+
- Maven
- MySQL corriendo localmente (si no se usa Docker)
- Docker Desktop instalado y corriendo

---

## 4. Configuración de bases de datos

Cada microservicio utiliza su propia base de datos. Si levantás los servicios en local (sin Docker), crea las bases antes de iniciar:

```sql
CREATE DATABASE smartlogix_inventario;
CREATE DATABASE smartlogix_pedidos;
CREATE DATABASE smartlogix_envios;
CREATE DATABASE db_smartlogix_usuarios;
```

Las credenciales se configuran en el archivo `.env` o directamente en el `application.properties` de cada microservicio.

---

## 5. Configuración de Keycloak

### 5.1 Levantar Keycloak con Docker

```bash
docker compose up keycloak
```

Luego ingresar a `http://localhost:8080` con usuario `admin` / contraseña `admin`.

> **Nota:** Asegúrate que el `docker-compose.yml` use estas variables de entorno:
> ```yaml
> KEYCLOAK_ADMIN: admin
> KEYCLOAK_ADMIN_PASSWORD: admin
> ```
> No uses `KC_BOOTSTRAP_ADMIN_USERNAME` — esas variables corresponden a versiones más nuevas y no funcionan con Keycloak 24.

### 5.2 Crear el Realm

1. Clic en el dropdown `Keycloak` (esquina superior izquierda)
2. Clic en **Create realm**
3. Realm name: `smartlogix`
4. Clic en **Create**

### 5.3 Configurar Login settings

Dentro del realm `smartlogix` → **Realm settings** → pestaña **Login**:

| Opción | Valor |
|---|---|
| Email as username | OFF |
| Login with email | OFF |
| Verify email | OFF |

Clic en **Save**.

### 5.4 Crear Roles

Ve a **Realm roles** → **Create role** y crea los siguientes roles:

- `ADMIN`
- `USER`

### 5.5 Crear el Client

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

Luego ve a la pestaña **Credentials** y copia el **Client secret** — lo necesitarás para solicitar tokens.

### 5.6 Crear usuario de prueba

Ve a **Users** → **Create user**:

| Campo | Valor |
|---|---|
| Username | `testuser` |
| Email | `testuser@test.com` |
| First name | `Test` |
| Last name | `User` |
| Email verified | ON |
| Required user actions | *(vacío)* |

Clic en **Create**. Luego en la pestaña **Credentials**:

- Clic en **Set password**
- Password: `Test1234`
- Temporary: **OFF**
- Clic en **Save password**

Luego en la pestaña **Role mapping**:

- Clic en **Assign role**
- Selecciona `USER` y `ADMIN`
- Clic en **Assign**

---

## 6. Levantar los microservicios

Levanta los servicios en este orden (cada uno en una terminal separada):

```bash
# 1. Eureka primero
cd Backend/smartlogix-parent/Eureka
mvn spring-boot:run

# 2. Microservicios (en terminales separadas)
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

Para compilar todo el proyecto desde la raíz:

```bash
cd Backend/smartlogix-parent
mvn clean install -DskipTests
```

---

## 7. Levantar con Docker Compose

Para levantar toda la plataforma (Keycloak, MySQL, microservicios y frontend) con un solo comando:

```bash
docker-compose up -d
```

Una vez levantado todo:

- Frontend: `http://localhost:3000`
- Eureka dashboard: `http://localhost:8761`
- Keycloak admin: `http://localhost:8080`

> La primera vez deberás configurar Keycloak manualmente siguiendo la [sección 5](#5-configuración-de-keycloak).

---

## 8. Obtener token JWT

### PowerShell

```powershell
$token = (Invoke-RestMethod -Method Post `
  -Uri "http://localhost:8080/realms/smartlogix/protocol/openid-connect/token" `
  -ContentType "application/x-www-form-urlencoded" `
  -Body @{
    grant_type    = "password"
    client_id     = "smartlogix-app"
    client_secret = "TU_CLIENT_SECRET"
    username      = "testuser"
    password      = "Test1234"
  }).access_token
```

### Bash / CMD

```bash
curl -X POST "http://localhost:8080/realms/smartlogix/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=smartlogix-app&client_secret=TU_CLIENT_SECRET&username=testuser&password=Test1234"
```

Respuesta esperada:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiJ9...",
  "token_type": "Bearer",
  "expires_in": 300
}
```

---

## 9. Consumir los microservicios

Agrega el token en el header `Authorization` de cada request:

```
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...
```

### PowerShell

```powershell
# Inventario
Invoke-RestMethod -Uri "http://localhost:8081/api/inventario/productos" `
  -Headers @{ Authorization = "Bearer $token" }

# Pedidos
Invoke-RestMethod -Uri "http://localhost:8082/api/pedidos" `
  -Headers @{ Authorization = "Bearer $token" }

# Usuarios
Invoke-RestMethod -Uri "http://localhost:8084/api/usuarios" `
  -Headers @{ Authorization = "Bearer $token" }

# Envios
Invoke-RestMethod -Uri "http://localhost:8083/api/envios" `
  -Headers @{ Authorization = "Bearer $token" }
```

### Bash

```bash
curl -H "Authorization: Bearer TU_TOKEN" http://localhost:8081/api/inventario/productos
curl -H "Authorization: Bearer TU_TOKEN" http://localhost:8082/api/pedidos
curl -H "Authorization: Bearer TU_TOKEN" http://localhost:8084/api/usuarios
curl -H "Authorization: Bearer TU_TOKEN" http://localhost:8083/api/envios
```

---

## 10. Documentación Swagger

Cada microservicio expone su documentación en:

| Microservicio | URL Swagger |
|---|---|
| Inventario | http://localhost:8081/swagger-ui.html |
| Pedidos | http://localhost:8082/swagger-ui.html |
| Envios | http://localhost:8083/swagger-ui.html |
| Usuarios | http://localhost:8084/swagger-ui.html |

Para autenticarte en Swagger: clic en **Authorize** → pegar el token con el formato `Bearer eyJhbGci...`

---

## 11. Health checks

| Microservicio | URL |
|---|---|
| Inventario | http://localhost:8081/actuator/health |
| Pedidos | http://localhost:8082/actuator/health |
| Usuarios | http://localhost:8084/actuator/health |
| Envíos | http://localhost:8083/actuator/health |

---

## 12. Roles y permisos

| Rol | Permisos |
|---|---|
| `USER` | `GET` — consultar recursos |
| `ADMIN` | `GET` + `POST` + `PUT` + `DELETE` — gestión completa |

Los siguientes endpoints son públicos (no requieren token):

- `/actuator/**`
- `/swagger-ui/**`
- `/v3/api-docs/**`

---

## 13. Flujo de autenticación

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

## Notas técnicas

- Se usa **Spring Boot 3.3.5** para compatibilidad estable con Java 17.
- Se eliminó **Lombok** para evitar errores con NetBeans/JDK.
- **msPedidos** usa `RestTemplate` con un `@Bean` explícito en `AppConfig.java` para llamar a msInventario.
- Las URLs de Eureka y Keycloak dentro de Docker usan variables de entorno (`${EUREKA_URL}`, `${KEYCLOAK_URL}`) para evitar conflictos con `localhost`.
- El frontend usa proxy en Vite para desarrollo y Nginx para producción Docker.
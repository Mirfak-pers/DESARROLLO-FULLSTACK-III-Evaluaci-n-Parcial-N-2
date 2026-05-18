# SmartLogix - Proyecto corregido

Cambios realizados:

- Se corrigió `smartlogix-parent/pom.xml`.
- Se eliminaron rastros de conflicto de rama dentro de `<modules>`.
- Se agregaron los módulos: `Inventario`, `Pedidos`, `Usuarios`, `msEnvios`.
- Se bajó Spring Boot a `3.3.5` para trabajar estable con Java 17.
- Se eliminó Lombok para evitar errores de NetBeans/JDK.
- Se agregó Swagger a Inventario, Pedidos, Usuarios y Envíos.
- Se agregó Actuator/health a todos.
- Se reconstruyó el código fuente de Pedidos porque en el ZIP original venía solo `target` y no venía `src` ni `pom.xml`.

## Puertos

- Inventario: `8081`
- Pedidos: `8082`
- Usuarios: `8084`
- Envíos: `8085`

## Swagger

- Inventario: http://localhost:8081/swagger-ui.html
- Pedidos: http://localhost:8082/swagger-ui.html
- Usuarios: http://localhost:8084/swagger-ui.html
- Envíos: http://localhost:8085/swagger-ui.html

## Health

- Inventario: http://localhost:8081/actuator/health
- Pedidos: http://localhost:8082/actuator/health
- Usuarios: http://localhost:8084/actuator/health
- Envíos: http://localhost:8085/actuator/health

## APIs principales

- Inventario: http://localhost:8081/api/inventario/productos
- Pedidos: http://localhost:8082/api/pedidos
- Usuarios: http://localhost:8084/api/usuarios
- Envíos: http://localhost:8085/api/envios

## Comandos recomendados

Desde la carpeta `smartlogix-parent`:

```powershell
mvn clean install -DskipTests
```

Para ejecutar un microservicio individual:

```powershell
cd Inventario
mvn spring-boot:run
```

```powershell
cd Pedidos
mvn spring-boot:run
```

```powershell
cd Usuarios
mvn spring-boot:run
```

```powershell
cd msEnvios
mvn spring-boot:run
```

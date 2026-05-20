package com.smartlogix.pedidos.service;

import com.smartlogix.pedidos.dto.CambiarEstadoRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class EnviosClientService {

    private static final Logger logger =
            LoggerFactory.getLogger(EnviosClientService.class);

    private final RestTemplate restTemplate;
    private final HttpServletRequest request;

    @Value("${servicios.envios.url:http://localhost:8083/api/envios}")
    private String enviosServiceUrl;

    public EnviosClientService(RestTemplate restTemplate,
                                HttpServletRequest request) {
        this.restTemplate = restTemplate;
        this.request = request;
    }

    /**
     * Crea un envío automáticamente en el microservicio de Envíos
     * cuando un pedido es aprobado.
     *
     * @param pedidoId   ID del pedido aprobado
     * @param usuarioId  ID del usuario extraído del token JWT (puede ser null → usa 0L)
     * @param cambioReq  Request con los datos de dirección/envío
     */
    public void crearEnvioAutomatico(Long pedidoId,
                                     Long usuarioId,
                                     CambiarEstadoRequest cambioReq) {
        logger.info("Creando envío automático para pedido ID: {}", pedidoId);

        HttpHeaders headers = crearHeadersConToken();

        Map<String, Object> body = new HashMap<>();
        body.put("pedidoId",           pedidoId);
        body.put("usuarioId",          usuarioId != null ? usuarioId : 0L);
        body.put("direccionDestino",   cambioReq.getDireccionDestino());
        body.put("ciudadDestino",      cambioReq.getCiudadDestino());
        body.put("regionDestino",      cambioReq.getRegionDestino());
        body.put("transportista",      cambioReq.getTransportista() != null
                                           ? cambioReq.getTransportista()
                                           : "Por asignar");
        // Fecha estimada: 5 días desde hoy
        body.put("fechaEntregaEstimada",
                 LocalDateTime.now().plusDays(5).toString());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            restTemplate.exchange(
                    enviosServiceUrl,
                    HttpMethod.POST,
                    entity,
                    Object.class
            );
            logger.info("Envío creado correctamente para pedido ID: {}", pedidoId);
        } catch (Exception e) {
            // No lanzamos excepción: el pedido ya fue aprobado.
            // El envío puede crearse manualmente si el microservicio está caído.
            logger.error("No se pudo crear envío automático para pedido ID: {}. Error: {}",
                         pedidoId, e.getMessage());
        }
    }

    private HttpHeaders crearHeadersConToken() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authorization != null && authorization.startsWith("Bearer ")) {
            headers.set(HttpHeaders.AUTHORIZATION, authorization);
        } else {
            logger.warn("No se encontró token Authorization al crear envío automático");
        }
        return headers;
    }
}
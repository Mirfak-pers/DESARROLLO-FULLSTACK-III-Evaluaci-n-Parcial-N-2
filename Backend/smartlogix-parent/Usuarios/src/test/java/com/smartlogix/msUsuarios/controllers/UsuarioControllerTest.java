package com.smartlogix.msUsuarios.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlogix.msUsuarios.models.Usuario;
import com.smartlogix.msUsuarios.security.SecurityConfig;
import com.smartlogix.msUsuarios.services.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// @WebMvcTest: levanta SOLO la capa web (controller + security), sin BD
// @Import(SecurityConfig.class): incluye la config de seguridad real del proyecto
@WebMvcTest(UsuarioController.class)
@Import(SecurityConfig.class)
@DisplayName("Tests de integración — UsuarioController")
class UsuarioControllerTest {

    @Autowired
    private MockMvc mockMvc; // Cliente HTTP simulado

    @Autowired
    private ObjectMapper objectMapper; // Para convertir objetos a JSON

    // @MockBean: reemplaza el bean real por uno falso en el contexto de Spring
    @MockBean
    private UsuarioService usuarioService;

    @MockBean
    private BCryptPasswordEncoder passwordEncoder;

    private Usuario usuarioEjemplo;

    @BeforeEach
    void setUp() {
        usuarioEjemplo = new Usuario(1L, "ana", "$2a$10$hashed", "ana@mail.com", "USER");
    }

    // ─────────────────────────────────────────────
    //  POST /api/usuarios/registro
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("POST /registro con datos válidos → 200 OK con UsuarioDTO")
    void testRegistrar_datosValidos_retorna200() throws Exception {
        // ARRANGE: cuando se llame a guardar() y encode(), retornar valores controlados
        when(passwordEncoder.encode("password123")).thenReturn("$2a$10$hashed");
        when(usuarioService.guardar(any(Usuario.class))).thenReturn(usuarioEjemplo);

        // JSON del body del request
        String body = """
                {
                    "username": "ana",
                    "password": "password123",
                    "email": "ana@mail.com",
                    "rol": "USER"
                }
                """;

        // ACT + ASSERT: enviamos el POST y verificamos la respuesta
        mockMvc.perform(post("/api/usuarios/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.username").value("ana"))
                .andExpect(jsonPath("$.email").value("ana@mail.com"))
                .andExpect(jsonPath("$.rol").value("USER"))
                // La contraseña NO debe aparecer en la respuesta (UsuarioDTO)
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    @DisplayName("POST /registro con username diferente → retorna los datos del usuario guardado")
    void testRegistrar_otroUsuario_retornaSuDTO() throws Exception {
        Usuario admin = new Usuario(2L, "carlos", "$2a$10$hashed2", "carlos@mail.com", "ADMIN");
        when(passwordEncoder.encode(any())).thenReturn("$2a$10$hashed2");
        when(usuarioService.guardar(any(Usuario.class))).thenReturn(admin);

        String body = """
                {
                    "username": "carlos",
                    "password": "securePass1",
                    "email": "carlos@mail.com",
                    "rol": "ADMIN"
                }
                """;

        mockMvc.perform(post("/api/usuarios/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("carlos"))
                .andExpect(jsonPath("$.rol").value("ADMIN"));
    }

    // ─────────────────────────────────────────────
    //  POST /api/usuarios/login
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("POST /login con credenciales válidas → 200 OK con UsuarioDTO")
    void testLogin_credencialesValidas_retorna200() throws Exception {
        // ARRANGE
        when(usuarioService.login("ana", "password123")).thenReturn(usuarioEjemplo);

        String body = """
                {
                    "username": "ana",
                    "password": "password123"
                }
                """;

        // ACT + ASSERT
        mockMvc.perform(post("/api/usuarios/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("ana"))
                .andExpect(jsonPath("$.email").value("ana@mail.com"))
                .andExpect(jsonPath("$.rol").value("USER"))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    @DisplayName("POST /login con credenciales inválidas → 500 (RuntimeException)")
    void testLogin_credencialesInvalidas_retornaError() throws Exception {
        // ARRANGE: el servicio lanza excepción
        when(usuarioService.login("ana", "mala")).thenThrow(new RuntimeException("Credenciales inválidas"));

        String body = """
                {
                    "username": "ana",
                    "password": "mala"
                }
                """;

        // ACT + ASSERT: Spring retorna 500 cuando hay RuntimeException no manejada
        mockMvc.perform(post("/api/usuarios/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isInternalServerError());
    }

    // ─────────────────────────────────────────────
    //  GET /api/usuarios
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/usuarios (autenticado) → 200 OK con lista de usuarios")
    void testListar_autenticado_retornaLista() throws Exception {
        // ARRANGE
        List<Usuario> lista = List.of(
                usuarioEjemplo,
                new Usuario(2L, "bob", "$2a$10$hashed2", "bob@mail.com", "ADMIN")
        );
        when(usuarioService.listarTodos()).thenReturn(lista);

        // ACT + ASSERT: usamos httpBasic para pasar la seguridad
        mockMvc.perform(get("/api/usuarios")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic("ana", "password123")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].username").value("ana"))
                .andExpect(jsonPath("$[1].username").value("bob"));
    }

    @Test
    @DisplayName("GET /api/usuarios (sin autenticación) → 401 Unauthorized")
    void testListar_sinAutenticacion_retorna401() throws Exception {
        // La ruta GET /api/usuarios requiere autenticación según SecurityConfig
        mockMvc.perform(get("/api/usuarios"))
                .andExpect(status().isUnauthorized());
    }
}
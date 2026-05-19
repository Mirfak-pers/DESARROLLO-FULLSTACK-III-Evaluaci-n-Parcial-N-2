package com.smartlogix.msUsuarios.controllers;

import com.smartlogix.msUsuarios.dto.LoginDTO;
import com.smartlogix.msUsuarios.dto.UsuarioDTO;
import com.smartlogix.msUsuarios.dto.UsuarioRegistroDTO;
import com.smartlogix.msUsuarios.models.Usuario;
import com.smartlogix.msUsuarios.services.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@Tag(name = "Usuarios", description = "Operaciones de gestión y autenticación de usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // ─── GET /api/usuarios ───────────────────────────────────────────────────

    @Operation(
        summary = "Listar todos los usuarios",
        description = "Retorna la lista completa de usuarios registrados en el sistema. Requiere autenticación."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Lista de usuarios obtenida exitosamente",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = Usuario.class)))
        ),
        @ApiResponse(responseCode = "403", description = "Acceso denegado — se requiere autenticación",
            content = @Content)
    })
    @GetMapping
    public List<Usuario> listar() {
        return usuarioService.listarTodos();
    }

    // ─── POST /api/usuarios/login ─────────────────────────────────────────────

    @Operation(
        summary = "Iniciar sesión",
        description = "Autentica a un usuario con su username y contraseña. Retorna los datos del usuario si las credenciales son correctas."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Login exitoso",
            content = @Content(schema = @Schema(implementation = UsuarioDTO.class))
        ),
        @ApiResponse(responseCode = "401", description = "Credenciales incorrectas",
            content = @Content),
        @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos",
            content = @Content)
    })
    @PostMapping("/login")
    public UsuarioDTO login(@RequestBody LoginDTO loginDTO) {
        Usuario usuario = usuarioService.login(loginDTO.getUsername(), loginDTO.getPassword());
        return new UsuarioDTO(usuario.getId(), usuario.getUsername(), usuario.getEmail(), usuario.getRol());
    }

    // ─── POST /api/usuarios/registro ──────────────────────────────────────────

    @Operation(
        summary = "Registrar nuevo usuario",
        description = "Crea un nuevo usuario en el sistema. La contraseña se almacena encriptada con BCrypt."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Usuario registrado exitosamente",
            content = @Content(schema = @Schema(implementation = UsuarioDTO.class))
        ),
        @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos (validación fallida)",
            content = @Content),
        @ApiResponse(responseCode = "409", description = "El username o email ya existe",
            content = @Content)
    })
    @PostMapping("/registro")
    public UsuarioDTO registrar(@RequestBody UsuarioRegistroDTO registroDTO) {
        Usuario usuario = new Usuario();
        usuario.setUsername(registroDTO.getUsername());
        usuario.setPassword(passwordEncoder.encode(registroDTO.getPassword()));
        usuario.setEmail(registroDTO.getEmail());
        usuario.setRol(registroDTO.getRol());

        Usuario guardado = usuarioService.guardar(usuario);
        return new UsuarioDTO(guardado.getId(), guardado.getUsername(), guardado.getEmail(), guardado.getRol());
    }
}
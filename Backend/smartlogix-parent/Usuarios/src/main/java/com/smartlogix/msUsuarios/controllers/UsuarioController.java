package com.smartlogix.msUsuarios.controllers;

import com.smartlogix.msUsuarios.dto.LoginDTO;
import com.smartlogix.msUsuarios.dto.UsuarioDTO;
import com.smartlogix.msUsuarios.dto.UsuarioRegistroDTO;
import com.smartlogix.msUsuarios.models.Usuario;
import com.smartlogix.msUsuarios.services.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
@Tag(name = "Usuarios", description = "Operaciones de gestión y autenticación de usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @Operation(summary = "Listar usuarios")
    @GetMapping
    public List<UsuarioDTO> listar() {
        return usuarioService.listarTodos()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Operation(summary = "Buscar usuario por ID")
    @GetMapping("/{id}")
    public UsuarioDTO buscarPorId(@PathVariable Long id) {
        return toDto(usuarioService.buscarPorId(id));
    }

    @Operation(summary = "Iniciar sesión")
    @PostMapping("/login")
    public UsuarioDTO login(@RequestBody LoginDTO loginDTO) {
        Usuario usuario = usuarioService.login(
                loginDTO.getUsername(),
                loginDTO.getPassword()
        );

        return toDto(usuario);
    }

    @Operation(summary = "Registrar nuevo usuario")
    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioDTO registrar(@RequestBody UsuarioRegistroDTO registroDTO) {
        Usuario usuario = new Usuario();
        usuario.setUsername(registroDTO.getUsername());
        usuario.setPassword(registroDTO.getPassword());
        usuario.setEmail(registroDTO.getEmail());
        usuario.setRol(registroDTO.getRol());

        Usuario guardado = usuarioService.guardar(usuario);

        return toDto(guardado);
    }

    @Operation(summary = "Actualizar usuario")
    @PutMapping("/{id}")
    public UsuarioDTO actualizar(
            @PathVariable Long id,
            @RequestBody UsuarioRegistroDTO registroDTO
    ) {
        Usuario usuario = new Usuario();
        usuario.setUsername(registroDTO.getUsername());
        usuario.setPassword(registroDTO.getPassword());
        usuario.setEmail(registroDTO.getEmail());
        usuario.setRol(registroDTO.getRol());

        Usuario actualizado = usuarioService.actualizar(id, usuario);

        return toDto(actualizado);
    }

    @Operation(summary = "Eliminar usuario")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        usuarioService.eliminar(id);
    }

    private UsuarioDTO toDto(Usuario usuario) {
        return new UsuarioDTO(
                usuario.getId(),
                usuario.getUsername(),
                usuario.getEmail(),
                usuario.getRol()
        );
    }
}
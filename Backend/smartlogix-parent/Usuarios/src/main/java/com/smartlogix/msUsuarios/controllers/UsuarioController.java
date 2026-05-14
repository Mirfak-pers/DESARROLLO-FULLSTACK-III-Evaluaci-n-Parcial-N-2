/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.smartlogix.msUsuarios.controllers;

import com.smartlogix.msUsuarios.dto.LoginDTO;
import com.smartlogix.msUsuarios.dto.UsuarioDTO;
import com.smartlogix.msUsuarios.dto.UsuarioRegistroDTO;
import com.smartlogix.msUsuarios.models.Usuario;
import com.smartlogix.msUsuarios.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@RestController
@RequestMapping("/api/usuarios") // URL base para este microservicio
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    public List<Usuario> listar() {
        return usuarioService.listarTodos();
    }
    @PostMapping("/login")
    public UsuarioDTO login(@RequestBody LoginDTO loginDTO) {
        Usuario usuario = usuarioService.login(loginDTO.getUsername(), loginDTO.getPassword());
        return new UsuarioDTO(usuario.getId(), usuario.getUsername(), usuario.getEmail(), usuario.getRol());
    }
    @Autowired
    private BCryptPasswordEncoder passwordEncoder; // Inyectamos el encriptador

    @PostMapping("/registro")
    public UsuarioDTO registrar(@RequestBody UsuarioRegistroDTO registroDTO) {
        Usuario usuario = new Usuario();
        usuario.setUsername(registroDTO.getUsername());

        // ENCRIPTACIÓN AQUÍ:
        usuario.setPassword(passwordEncoder.encode(registroDTO.getPassword())); 

        usuario.setEmail(registroDTO.getEmail());
        usuario.setRol(registroDTO.getRol());

        Usuario guardado = usuarioService.guardar(usuario);

        return new UsuarioDTO(guardado.getId(), guardado.getUsername(), guardado.getEmail(), guardado.getRol());
    }
}
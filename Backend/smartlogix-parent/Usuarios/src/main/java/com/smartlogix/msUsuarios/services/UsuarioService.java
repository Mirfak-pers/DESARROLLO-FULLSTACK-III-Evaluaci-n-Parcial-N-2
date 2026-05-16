/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.smartlogix.msUsuarios.services;

import com.smartlogix.msUsuarios.models.Usuario;
import com.smartlogix.msUsuarios.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Obtener todos los empleados de SmartLogix
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    // Guardar un nuevo usuario
    public Usuario guardar(Usuario usuario) {
        // Aquí podrías agregar lógica para encriptar la contraseña antes de guardar
        return usuarioRepository.save(usuario);
    }

    // Buscar por ID
    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id).orElse(null);
    }

    // Eliminar usuario
    public void eliminar(Long id) {
        usuarioRepository.deleteById(id);
    }
    
        @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public Usuario login(String username, String password) {
        return usuarioRepository.findByUsername(username)
            .filter(user -> passwordEncoder.matches(password, user.getPassword()))
            .orElseThrow(() -> new RuntimeException("Credenciales inválidas"));
    }
}
package com.smartlogix.msUsuarios.services;

import com.smartlogix.msUsuarios.models.Usuario;
import com.smartlogix.msUsuarios.repositories.UsuarioRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    private static final Logger logger = LoggerFactory.getLogger(UsuarioService.class);

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public List<Usuario> listarTodos() {
        logger.info("Listando todos los usuarios");
        return usuarioRepository.findAll();
    }

    public Usuario guardar(Usuario usuario) {
        logger.info("Registrando usuario: {}", usuario.getUsername());

        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));

        Usuario guardado = usuarioRepository.save(usuario);

        logger.info("Usuario registrado correctamente con ID: {}", guardado.getId());

        return guardado;
    }

    public Usuario buscarPorId(Long id) {
        logger.info("Buscando usuario ID: {}", id);

        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
    }

    public Usuario actualizar(Long id, Usuario datos) {
        logger.info("Actualizando usuario ID: {}", id);

        Usuario usuario = buscarPorId(id);

        usuario.setUsername(datos.getUsername());
        usuario.setEmail(datos.getEmail());
        usuario.setRol(datos.getRol());

        if (datos.getPassword() != null && !datos.getPassword().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(datos.getPassword()));
        }

        Usuario actualizado = usuarioRepository.save(usuario);

        logger.info("Usuario actualizado correctamente ID: {}", actualizado.getId());

        return actualizado;
    }

    public void eliminar(Long id) {
        logger.warn("Eliminando usuario ID: {}", id);

        Usuario usuario = buscarPorId(id);

        usuarioRepository.delete(usuario);

        logger.info("Usuario eliminado correctamente ID: {}", id);
    }

    public Usuario login(String username, String password) {
        logger.info("Intento de login para usuario: {}", username);

        Usuario usuario = usuarioRepository
                .findByUsername(username)
                .filter(user -> passwordEncoder.matches(password, user.getPassword()))
                .orElseThrow(() -> {
                    logger.warn("Login fallido para usuario: {}", username);
                    return new RuntimeException("Credenciales inválidas");
                });

        logger.info("Login exitoso para usuario: {}", username);

        return usuario;
    }
}
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

    private static final Logger logger =
            LoggerFactory.getLogger(UsuarioService.class);

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // ==========================
    // LISTAR USUARIOS
    // ==========================
    public List<Usuario> listarTodos() {

        logger.info("Listando todos los usuarios");

        return usuarioRepository.findAll();
    }

    // ==========================
    // GUARDAR USUARIO
    // ==========================
    public Usuario guardar(Usuario usuario) {

        logger.info(
                "Registrando usuario: {}",
                usuario.getUsername()
        );

        // Encriptar contraseña
        usuario.setPassword(
                passwordEncoder.encode(
                        usuario.getPassword()
                )
        );

        Usuario guardado =
                usuarioRepository.save(usuario);

        logger.info(
                "Usuario registrado correctamente con ID: {}",
                guardado.getId()
        );

        return guardado;
    }

    // ==========================
    // BUSCAR POR ID
    // ==========================
    public Usuario buscarPorId(Long id) {

        logger.info(
                "Buscando usuario ID: {}",
                id
        );

        Usuario usuario =
                usuarioRepository.findById(id)
                        .orElse(null);

        if (usuario == null) {
            logger.warn(
                    "Usuario no encontrado ID: {}",
                    id
            );
        }

        return usuario;
    }

    // ==========================
    // ELIMINAR USUARIO
    // ==========================
    public void eliminar(Long id) {

        logger.warn(
                "Eliminando usuario ID: {}",
                id
        );

        usuarioRepository.deleteById(id);

        logger.info(
                "Usuario eliminado correctamente ID: {}",
                id
        );
    }

    // ==========================
    // LOGIN
    // ==========================
    public Usuario login(
            String username,
            String password
    ) {

        logger.info(
                "Intento de login para usuario: {}",
                username
        );

        Usuario usuario = usuarioRepository
                .findByUsername(username)
                .filter(user ->
                        passwordEncoder.matches(
                                password,
                                user.getPassword()
                        )
                )
                .orElseThrow(() -> {

                    logger.warn(
                            "Login fallido para usuario: {}",
                            username
                    );

                    return new RuntimeException(
                            "Credenciales inválidas"
                    );
                });

        logger.info(
                "Login exitoso para usuario: {}",
                username
        );

        return usuario;
    }
}
package com.smartlogix.msUsuarios.repositories;

import com.smartlogix.msUsuarios.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    // Método personalizado para buscar por nombre de usuario (útil para el login)
    Optional<Usuario> findByUsername(String username);
    
    // Método para verificar si un email ya existe antes de registrar
    boolean existsByEmail(String email);
}
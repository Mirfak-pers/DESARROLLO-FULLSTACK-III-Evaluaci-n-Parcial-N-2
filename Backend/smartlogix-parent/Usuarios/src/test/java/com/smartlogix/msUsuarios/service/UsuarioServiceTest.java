package com.smartlogix.msUsuarios.service;

import com.smartlogix.msUsuarios.models.Usuario;
import com.smartlogix.msUsuarios.repositories.UsuarioRepository;
import com.smartlogix.msUsuarios.services.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioService usuarioService;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        usuario = new Usuario(
                1L,
                "admin",
                "123456",
                "admin@smartlogix.cl",
                "ADMIN"
        );
    }

    @Test
    void listarTodos_deberiaRetornarListaDeUsuarios() {
        Usuario usuario2 = new Usuario(
                2L,
                "operador",
                "abcdef",
                "operador@smartlogix.cl",
                "OPERADOR"
        );

        when(usuarioRepository.findAll())
                .thenReturn(List.of(usuario, usuario2));

        List<Usuario> resultado = usuarioService.listarTodos();

        assertNotNull(resultado);
        assertEquals(2, resultado.size());
        assertEquals("admin", resultado.get(0).getUsername());
        assertEquals("operador", resultado.get(1).getUsername());

        verify(usuarioRepository).findAll();
    }

    @Test
    void guardar_deberiaGuardarUsuarioConPasswordEncriptada() {
        when(passwordEncoder.encode("123456"))
                .thenReturn("PASSWORD_ENCRIPTADA");

        when(usuarioRepository.save(any(Usuario.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Usuario resultado = usuarioService.guardar(usuario);

        assertNotNull(resultado);
        assertEquals("admin", resultado.getUsername());
        assertEquals("admin@smartlogix.cl", resultado.getEmail());
        assertEquals("ADMIN", resultado.getRol());
        assertEquals("PASSWORD_ENCRIPTADA", resultado.getPassword());
        assertNotEquals("123456", resultado.getPassword());

        verify(passwordEncoder).encode("123456");
        verify(usuarioRepository).save(any(Usuario.class));
    }

    @Test
    void buscarPorId_deberiaRetornarUsuarioCuandoExiste() {
        when(usuarioRepository.findById(1L))
                .thenReturn(Optional.of(usuario));

        Usuario resultado = usuarioService.buscarPorId(1L);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
        assertEquals("admin", resultado.getUsername());
        assertEquals("admin@smartlogix.cl", resultado.getEmail());

        verify(usuarioRepository).findById(1L);
    }

    @Test
    void login_deberiaRetornarUsuarioCuandoCredencialesSonValidas() {
        Usuario usuarioGuardado = new Usuario(
                1L,
                "admin",
                "PASSWORD_ENCRIPTADA",
                "admin@smartlogix.cl",
                "ADMIN"
        );

        when(usuarioRepository.findByUsername("admin"))
                .thenReturn(Optional.of(usuarioGuardado));

        when(passwordEncoder.matches("123456", "PASSWORD_ENCRIPTADA"))
                .thenReturn(true);

        Usuario resultado = usuarioService.login("admin", "123456");

        assertNotNull(resultado);
        assertEquals("admin", resultado.getUsername());
        assertEquals("ADMIN", resultado.getRol());

        verify(usuarioRepository).findByUsername("admin");
        verify(passwordEncoder).matches("123456", "PASSWORD_ENCRIPTADA");
    }

    @Test
    void login_deberiaLanzarErrorCuandoCredencialesSonInvalidas() {
        Usuario usuarioGuardado = new Usuario(
                1L,
                "admin",
                "PASSWORD_ENCRIPTADA",
                "admin@smartlogix.cl",
                "ADMIN"
        );

        when(usuarioRepository.findByUsername("admin"))
                .thenReturn(Optional.of(usuarioGuardado));

        when(passwordEncoder.matches("claveIncorrecta", "PASSWORD_ENCRIPTADA"))
                .thenReturn(false);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> usuarioService.login("admin", "claveIncorrecta")
        );

        assertEquals("Credenciales inválidas", exception.getMessage());

        verify(usuarioRepository).findByUsername("admin");
        verify(passwordEncoder).matches("claveIncorrecta", "PASSWORD_ENCRIPTADA");
    }
}
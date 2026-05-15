package com.smartlogix.msUsuarios.services;

import com.smartlogix.msUsuarios.models.Usuario;
import com.smartlogix.msUsuarios.repositories.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

// @ExtendWith(MockitoExtension.class): activa Mockito sin levantar Spring
@ExtendWith(MockitoExtension.class)
@DisplayName("Tests unitarios — UsuarioService")
class UsuarioServiceTest {

    // @Mock: crea un objeto falso (no toca la BD real)
    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    // @InjectMocks: crea el servicio e inyecta los @Mock anteriores
    @InjectMocks
    private UsuarioService usuarioService;

    // Usuario de prueba reutilizado en varios tests
    private Usuario usuarioEjemplo;

    @BeforeEach
    void setUp() {
        // Se ejecuta antes de cada test — prepara datos comunes
        usuarioEjemplo = new Usuario(1L, "juan", "$2a$10$hashedPassword", "juan@mail.com", "USER");
    }

    // ─────────────────────────────────────────────
    //  Tests de login()
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("login() con credenciales válidas → retorna el usuario")
    void testLogin_credencialesValidas_retornaUsuario() {
        // ARRANGE: configuramos qué devuelven los mocks
        when(usuarioRepository.findByUsername("juan"))
                .thenReturn(Optional.of(usuarioEjemplo));
        when(passwordEncoder.matches("password123", usuarioEjemplo.getPassword()))
                .thenReturn(true);

        // ACT: llamamos al método real
        Usuario resultado = usuarioService.login("juan", "password123");

        // ASSERT: verificamos el resultado
        assertNotNull(resultado);
        assertEquals("juan", resultado.getUsername());
        assertEquals("juan@mail.com", resultado.getEmail());
        assertEquals("USER", resultado.getRol());

        // Verificamos que sí se buscó en el repositorio
        verify(usuarioRepository, times(1)).findByUsername("juan");
        verify(passwordEncoder, times(1)).matches("password123", usuarioEjemplo.getPassword());
    }

    @Test
    @DisplayName("login() con username inexistente → lanza RuntimeException")
    void testLogin_usernameNoExiste_lanzaExcepcion() {
        // ARRANGE: el repositorio no encuentra al usuario
        when(usuarioRepository.findByUsername("fantasma"))
                .thenReturn(Optional.empty());

        // ACT + ASSERT: debe lanzar excepción con mensaje correcto
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> usuarioService.login("fantasma", "1234"));

        assertEquals("Credenciales inválidas", ex.getMessage());
        verify(usuarioRepository).findByUsername("fantasma");
        // El passwordEncoder NO debe haberse llamado si el usuario no existe
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    @DisplayName("login() con contraseña incorrecta → lanza RuntimeException")
    void testLogin_passwordIncorrecta_lanzaExcepcion() {
        // ARRANGE: el usuario existe pero la contraseña no coincide
        when(usuarioRepository.findByUsername("juan"))
                .thenReturn(Optional.of(usuarioEjemplo));
        when(passwordEncoder.matches("malaClave", usuarioEjemplo.getPassword()))
                .thenReturn(false);

        // ACT + ASSERT
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> usuarioService.login("juan", "malaClave"));

        assertEquals("Credenciales inválidas", ex.getMessage());
    }

    // ─────────────────────────────────────────────
    //  Tests de guardar()
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("guardar() un usuario nuevo → retorna usuario con ID asignado")
    void testGuardar_usuarioNuevo_retornaConId() {
        // ARRANGE
        Usuario sinId = new Usuario(null, "pedro", "hashed", "pedro@mail.com", "ADMIN");
        Usuario conId = new Usuario(2L, "pedro", "hashed", "pedro@mail.com", "ADMIN");
        when(usuarioRepository.save(sinId)).thenReturn(conId);

        // ACT
        Usuario resultado = usuarioService.guardar(sinId);

        // ASSERT
        assertNotNull(resultado.getId());
        assertEquals(2L, resultado.getId());
        assertEquals("pedro", resultado.getUsername());
        verify(usuarioRepository).save(sinId);
    }

    // ─────────────────────────────────────────────
    //  Tests de listarTodos()
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("listarTodos() → retorna lista con todos los usuarios")
    void testListarTodos_retornaLista() {
        // ARRANGE
        List<Usuario> lista = List.of(
                usuarioEjemplo,
                new Usuario(2L, "maria", "hashed2", "maria@mail.com", "ADMIN")
        );
        when(usuarioRepository.findAll()).thenReturn(lista);

        // ACT
        List<Usuario> resultado = usuarioService.listarTodos();

        // ASSERT
        assertEquals(2, resultado.size());
        assertEquals("juan", resultado.get(0).getUsername());
        assertEquals("maria", resultado.get(1).getUsername());
    }

    @Test
    @DisplayName("listarTodos() sin usuarios → retorna lista vacía")
    void testListarTodos_sinUsuarios_retornaListaVacia() {
        when(usuarioRepository.findAll()).thenReturn(List.of());

        List<Usuario> resultado = usuarioService.listarTodos();

        assertNotNull(resultado);
        assertTrue(resultado.isEmpty());
    }

    // ─────────────────────────────────────────────
    //  Tests de buscarPorId()
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("buscarPorId() con ID existente → retorna el usuario")
    void testBuscarPorId_existente_retornaUsuario() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioEjemplo));

        Usuario resultado = usuarioService.buscarPorId(1L);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
    }

    @Test
    @DisplayName("buscarPorId() con ID inexistente → retorna null")
    void testBuscarPorId_noExistente_retornaNull() {
        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        Usuario resultado = usuarioService.buscarPorId(99L);

        assertNull(resultado);
    }

    // ─────────────────────────────────────────────
    //  Tests de eliminar()
    // ─────────────────────────────────────────────

    @Test
    @DisplayName("eliminar() → llama al repositorio con el ID correcto")
    void testEliminar_llamaAlRepositorio() {
        // No necesitamos retorno (void), solo verificamos que se llamó
        doNothing().when(usuarioRepository).deleteById(1L);

        usuarioService.eliminar(1L);

        verify(usuarioRepository, times(1)).deleteById(1L);
    }
}
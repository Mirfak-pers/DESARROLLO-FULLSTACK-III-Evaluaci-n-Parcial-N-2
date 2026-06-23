package com.smartlogix.msUsuarios.controllers;

import com.smartlogix.msUsuarios.dto.LoginDTO;
import com.smartlogix.msUsuarios.dto.UsuarioDTO;
import com.smartlogix.msUsuarios.dto.UsuarioRegistroDTO;
import com.smartlogix.msUsuarios.models.Usuario;
import com.smartlogix.msUsuarios.services.UsuarioService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsuarioControllerTest {

    @Mock
    private UsuarioService usuarioService;

    @InjectMocks
    private UsuarioController usuarioController;

    private Usuario crearUsuario(Long id, String username, String password, String email, String rol) {
        Usuario usuario = new Usuario();
        usuario.setId(id);
        usuario.setUsername(username);
        usuario.setPassword(password);
        usuario.setEmail(email);
        usuario.setRol(rol);
        return usuario;
    }

    @Test
    void listar_deberiaRetornarUsuariosSinPassword() {
        Usuario usuario1 = crearUsuario(
                1L,
                "admin",
                "PASSWORD_ENCRIPTADA",
                "admin@smartlogix.cl",
                "ADMIN"
        );

        Usuario usuario2 = crearUsuario(
                2L,
                "cliente",
                "PASSWORD_ENCRIPTADA",
                "cliente@smartlogix.cl",
                "CLIENTE"
        );

        when(usuarioService.listarTodos()).thenReturn(List.of(usuario1, usuario2));

        List<UsuarioDTO> resultado = usuarioController.listar();

        assertNotNull(resultado);
        assertEquals(2, resultado.size());

        assertEquals(1L, resultado.get(0).getId());
        assertEquals("admin", resultado.get(0).getUsername());
        assertEquals("admin@smartlogix.cl", resultado.get(0).getEmail());
        assertEquals("ADMIN", resultado.get(0).getRol());

        assertEquals(2L, resultado.get(1).getId());
        assertEquals("cliente", resultado.get(1).getUsername());
        assertEquals("cliente@smartlogix.cl", resultado.get(1).getEmail());
        assertEquals("CLIENTE", resultado.get(1).getRol());

        verify(usuarioService).listarTodos();
    }

    @Test
    void buscarPorId_deberiaRetornarUsuarioDTO() {
        Usuario usuario = crearUsuario(
                1L,
                "admin",
                "PASSWORD_ENCRIPTADA",
                "admin@smartlogix.cl",
                "ADMIN"
        );

        when(usuarioService.buscarPorId(1L)).thenReturn(usuario);

        UsuarioDTO resultado = usuarioController.buscarPorId(1L);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
        assertEquals("admin", resultado.getUsername());
        assertEquals("admin@smartlogix.cl", resultado.getEmail());
        assertEquals("ADMIN", resultado.getRol());

        verify(usuarioService).buscarPorId(1L);
    }

    @Test
    void login_deberiaRetornarUsuarioDTOCuandoCredencialesSonValidas() {
        LoginDTO loginDTO = new LoginDTO();
        loginDTO.setUsername("admin");
        loginDTO.setPassword("123456");

        Usuario usuario = crearUsuario(
                1L,
                "admin",
                "PASSWORD_ENCRIPTADA",
                "admin@smartlogix.cl",
                "ADMIN"
        );

        when(usuarioService.login("admin", "123456")).thenReturn(usuario);

        UsuarioDTO resultado = usuarioController.login(loginDTO);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
        assertEquals("admin", resultado.getUsername());
        assertEquals("admin@smartlogix.cl", resultado.getEmail());
        assertEquals("ADMIN", resultado.getRol());

        verify(usuarioService).login("admin", "123456");
    }

    @Test
    void registrar_deberiaGuardarUsuarioYRetornarDTO() {
        UsuarioRegistroDTO registroDTO = new UsuarioRegistroDTO();
        registroDTO.setUsername("nuevo");
        registroDTO.setPassword("123456");
        registroDTO.setEmail("nuevo@smartlogix.cl");
        registroDTO.setRol("CLIENTE");

        Usuario usuarioGuardado = crearUsuario(
                3L,
                "nuevo",
                "PASSWORD_ENCRIPTADA",
                "nuevo@smartlogix.cl",
                "CLIENTE"
        );

        when(usuarioService.guardar(any(Usuario.class))).thenReturn(usuarioGuardado);

        UsuarioDTO resultado = usuarioController.registrar(registroDTO);

        assertNotNull(resultado);
        assertEquals(3L, resultado.getId());
        assertEquals("nuevo", resultado.getUsername());
        assertEquals("nuevo@smartlogix.cl", resultado.getEmail());
        assertEquals("CLIENTE", resultado.getRol());

        verify(usuarioService).guardar(any(Usuario.class));
    }

    @Test
    void actualizar_deberiaActualizarUsuarioYRetornarDTO() {
        UsuarioRegistroDTO registroDTO = new UsuarioRegistroDTO();
        registroDTO.setUsername("actualizado");
        registroDTO.setPassword("654321");
        registroDTO.setEmail("actualizado@smartlogix.cl");
        registroDTO.setRol("OPERADOR");

        Usuario usuarioActualizado = crearUsuario(
                1L,
                "actualizado",
                "PASSWORD_ENCRIPTADA",
                "actualizado@smartlogix.cl",
                "OPERADOR"
        );

        when(usuarioService.actualizar(eq(1L), any(Usuario.class))).thenReturn(usuarioActualizado);

        UsuarioDTO resultado = usuarioController.actualizar(1L, registroDTO);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
        assertEquals("actualizado", resultado.getUsername());
        assertEquals("actualizado@smartlogix.cl", resultado.getEmail());
        assertEquals("OPERADOR", resultado.getRol());

        verify(usuarioService).actualizar(eq(1L), any(Usuario.class));
    }

    @Test
    void eliminar_deberiaLlamarAlServicio() {
        doNothing().when(usuarioService).eliminar(1L);

        usuarioController.eliminar(1L);

        verify(usuarioService).eliminar(1L);
    }
}
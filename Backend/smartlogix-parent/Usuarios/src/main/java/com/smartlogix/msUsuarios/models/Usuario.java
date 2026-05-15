package com.smartlogix.msUsuarios.models;

import jakarta.persistence.*; // Para las anotaciones de BD
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity // Define que esta clase es una tabla en MySQL
@Table(name = "usuarios") // Nombre de la tabla
@Data // Genera Getters, Setters, toString, equals y hashCode automáticamente (Lombok)
@AllArgsConstructor // Genera constructor con todos los campos
@NoArgsConstructor // Genera constructor vacío (obligatorio para JPA)
public class Usuario {

    @Id // Define la llave primaria
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto_increment en MySQL
    private Long id;

    @Column(unique = true, nullable = false) // No se puede repetir y no puede ser nulo
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String rol; // Ejemplo: "ADMIN", "USER", "BODEGA"
}
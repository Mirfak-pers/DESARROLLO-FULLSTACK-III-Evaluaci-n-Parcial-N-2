package com.smartlogix.msEnvios.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "envios")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Envio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Referencia al pedido del microservicio de Pedidos
    @Column(nullable = false)
    private Long pedidoId;

    // Referencia al usuario/cliente del microservicio de Usuarios
    @Column(nullable = false)
    private Long usuarioId;

    @Column(nullable = false)
    private String direccionDestino;

    @Column(nullable = false)
    private String ciudadDestino;

    @Column(nullable = false)
    private String regionDestino;

    // Número de seguimiento único
    @Column(unique = true, nullable = false)
    private String numeroSeguimiento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoEnvio estado;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaEntregaEstimada;

    private LocalDateTime fechaEntregaReal;

    // Transportista asignado
    private String transportista;

    @PrePersist
    public void prePersist() {
        this.fechaCreacion = LocalDateTime.now();
        if (this.estado == null) {
            this.estado = EstadoEnvio.PENDIENTE;
        }
    }
}

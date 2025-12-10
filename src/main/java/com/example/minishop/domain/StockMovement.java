package com.example.minishop.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "stock_movement")
@NoArgsConstructor
@AllArgsConstructor
public class StockMovement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @NotNull
    @Column(name = "quantity_change", nullable = false)
    private Integer quantityChange;

    @Size(max = 10)
    @NotNull
    @Column(name = "reason", nullable = false, length = 10)
    private String reason; // 'IN' | 'OUT'

    @Size(max = 100)
    @Column(name = "reference", length = 100)
    private String reference;

    @NotNull
    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "location_id")
    private Location location;

    @Size(max = 20)
    @Column(name = "reason_detail", length = 20)
    private String reasonDetail; // 'PURCHASE','SALE','RETURN_IN','RETURN_OUT','ADJUST','TRANSFER'

    @Size(max = 36)
    @Column(name = "correlation_id", length = 36)
    private String correlationId;

    // Jätame praegu ID-na; hiljem saab muuta ManyToOne(AppUser)
    @Column(name = "performed_by")
    private Long performedBy;

}
package com.example.minishop.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class ProductCategoryId implements Serializable {
    private static final long serialVersionUID = 1L;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;
}
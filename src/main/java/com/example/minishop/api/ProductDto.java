package com.example.minishop.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductDto implements Serializable {
    private Long id;

    @NotBlank
    @Size(max = 40)
    private String sku;

    @NotBlank
    @Size(max = 200)
    private String name;

    @NotNull
    @PositiveOrZero
    private Integer priceCents;

    @NotBlank
    @Size(min = 3, max = 3)
    private String currencyCode;
}
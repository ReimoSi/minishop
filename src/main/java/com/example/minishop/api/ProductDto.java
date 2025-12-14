package com.example.minishop.api;

import jakarta.validation.constraints.*;
import lombok.*;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductDto implements Serializable {
    private Long id;

    @NotBlank
    @Size(min = 1, max = 40)
    @Pattern(
            regexp = "^[A-Z0-9][A-Z0-9._-]{0,39}$",
            message = "SKU must be 1–40 chars, start with A–Z/0–9 and contain only A–Z, 0–9, '.', '_' or '-'"
    )
    private String sku;

    @NotBlank
    @Size(max = 200)
    private String name;

    @NotNull
    @PositiveOrZero
    private Integer priceCents;

    @NotBlank
    @Size(min = 3, max = 3)
    @Pattern(regexp = "^[A-Z]{3}$", message = "Currency must be 3 uppercase letters")
    private String currencyCode;
}

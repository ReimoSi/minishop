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
    @Size(max = 40)
    @Pattern(regexp = "^[A-Z0-9-]{3,40}$",
            message = "SKU must be 3–40 chars, A-Z, 0-9 or '-'")
    private String sku;

    @NotBlank
    @Size(min = 2, max = 200)
    @Pattern(regexp = "^[\\p{L}0-9 .,'\\-()]{2,200}$",
            message = "Name can contain letters, numbers, spaces and .,'-()")
    private String name;

    @NotNull
    @PositiveOrZero
    private Integer priceCents;

    @NotBlank
    @Size(min = 3, max = 3)
    @Pattern(regexp = "^[A-Z]{3}$", message = "Currency must be 3 capital letters")
    private String currencyCode;
}

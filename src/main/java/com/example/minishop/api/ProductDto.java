package com.example.minishop.api;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Product payload (price in minor units, e.g. cents)")
public class ProductDto implements Serializable {

    @Schema(example = "1", description = "DB identifier", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    @NotBlank
    @Size(max = 40)
    @Pattern(regexp = "^[A-Z0-9-]{3,40}$",
            message = "SKU must be 3–40 chars, A-Z, 0-9 or '-'")
    @Schema(example = "SKU-APPLE-001")
    private String sku;

    @NotBlank
    @Size(min = 2, max = 200)
    @Pattern(regexp = "^[\\p{L}\\p{N} .,'\\-()&/]{2,200}$",
            message = "Name can contain letters, numbers, spaces and .,'-()&/")
    @Schema(example = "ONENOTE 1000")
    private String name;

    @NotNull
    @PositiveOrZero
    @Schema(example = "149", description = "Price in minor units (cents)")
    private Integer priceCents;

    @NotBlank
    @Pattern(regexp = "^[A-Z]{3}$", message = "Currency must be 3 capital letters")
    @Schema(example = "EUR")
    private String currencyCode;
}

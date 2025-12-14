package com.example.minishop.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CurrencyDto implements Serializable {
    @NotBlank
    @Size(min = 3, max = 3)
    private String code;

    @NotBlank
    @Size(max = 64)
    private String name;
}
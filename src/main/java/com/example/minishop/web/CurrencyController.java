package com.example.minishop.web;

import com.example.minishop.api.CurrencyDto;
import com.example.minishop.infrastructure.exception.NotFoundException;
import com.example.minishop.repo.CurrencyRepository;
import com.example.minishop.web.mapper.CurrencyMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Currencies", description = "Currency lookup endpoints")
@RestController
@RequestMapping("/api/currencies")
@RequiredArgsConstructor
public class CurrencyController {

    private final CurrencyRepository currencyRepo;
    private final CurrencyMapper mapper;

    @GetMapping
    @Operation(summary = "List currencies", description = "Returns all supported currencies")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "OK") })
    public List<CurrencyDto> list() {
        return mapper.toDto(currencyRepo.findAll());
    }

    @GetMapping("/{code}")
    @Operation(summary = "Get currency by code", description = "Returns single currency by 3-letter code")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "OK"),
            @ApiResponse(responseCode = "404", description = "Currency not found")
    })
    public CurrencyDto get(@PathVariable String code) {
        return currencyRepo.findById(code.toUpperCase())
                .map(mapper::toDto)
                .orElseThrow(() -> new NotFoundException("Currency " + code + " not found"));
    }
}

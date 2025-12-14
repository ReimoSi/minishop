package com.example.minishop.service;


import com.example.minishop.api.ProductDto;
import com.example.minishop.domain.Product;
import com.example.minishop.infrastructure.exception.NameConflictException;
import com.example.minishop.infrastructure.exception.NotFoundException;
import com.example.minishop.repo.CurrencyRepository;
import com.example.minishop.repo.ProductRepository;
import com.example.minishop.web.mapper.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepo;
    private final CurrencyRepository currencyRepo;
    private final ProductMapper mapper;

    @Transactional(readOnly = true)
    public List<ProductDto> findAll() {
        return mapper.toDto(productRepo.findAll());
    }

    @Transactional(readOnly = true)
    public ProductDto get(Long id) {
        Product p = productRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Product " + id + " not found"));
        return mapper.toDto(p);
    }

    public ProductDto create(ProductDto dto) {
        if (dto.getCurrencyCode() == null) {
            throw new IllegalArgumentException("currencyCode is required");
        }
        final String normalizedCurrency = dto.getCurrencyCode().trim().toUpperCase(Locale.ROOT);
        if (!currencyRepo.existsById(normalizedCurrency)) {
            throw new IllegalArgumentException("Unknown currency: " + normalizedCurrency);
        }

        final String normalizedSku = dto.getSku() == null ? null : dto.getSku().trim();
        if (normalizedSku == null || normalizedSku.isEmpty()) {
            throw new IllegalArgumentException("sku is required");
        }
        if (productRepo.existsBySku(normalizedSku)) {
            throw new NameConflictException("SKU already exists: " + normalizedSku);
        }

        Product entity = mapper.toEntity(dto);   // id/createdAt/updatedAt ignoreeritakse mapperis
        entity.setSku(normalizedSku);
        entity.setCurrencyCode(mapper.toCurrency(normalizedCurrency));

        Product saved = productRepo.save(entity);
        return mapper.toDto(saved);
    }

    public ProductDto update(Long id, ProductDto dto) {
        Product entity = productRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Product " + id + " not found"));

        final String normalizedSku = dto.getSku() == null ? null : dto.getSku().trim();
        if (normalizedSku == null || normalizedSku.isEmpty()) {
            throw new IllegalArgumentException("sku is required");
        }
        if (!entity.getSku().equals(normalizedSku) && productRepo.existsBySku(normalizedSku)) {
            throw new NameConflictException("SKU already exists: " + normalizedSku);
        }

        entity.setSku(normalizedSku);
        entity.setName(dto.getName());
        entity.setPriceCents(dto.getPriceCents());

        if (dto.getCurrencyCode() == null) {
            throw new IllegalArgumentException("currencyCode is required");
        }
        final String normalizedCurrency = dto.getCurrencyCode().trim().toUpperCase(Locale.ROOT);
        if (!currencyRepo.existsById(normalizedCurrency)) {
            throw new IllegalArgumentException("Unknown currency: " + normalizedCurrency);
        }
        entity.setCurrencyCode(mapper.toCurrency(normalizedCurrency));

        Product saved = productRepo.save(entity);
        return mapper.toDto(saved);
    }
}
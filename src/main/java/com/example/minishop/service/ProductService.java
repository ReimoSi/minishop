package com.example.minishop.service;

import com.example.minishop.api.ProductDto;
import com.example.minishop.domain.Product;
import com.example.minishop.infrastructure.exception.NameConflictException;
import com.example.minishop.infrastructure.exception.NotFoundException;
import com.example.minishop.repo.CurrencyRepository;
import com.example.minishop.repo.ProductRepository;
import com.example.minishop.web.mapper.ProductMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(Transactional.TxType.REQUIRED)
public class ProductService {
    private final ProductRepository productRepo;
    private final CurrencyRepository currencyRepo;
    private final ProductMapper mapper;

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<ProductDto> findAll() {
        return mapper.toDto(productRepo.findAll());
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public ProductDto get(Long id) {
        Product p = productRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Product " + id + " not found"));
        return mapper.toDto(p);
    }

    public ProductDto create(ProductDto dto) {
        if (dto.getCurrencyCode() == null) {
            throw new IllegalArgumentException("currencyCode is required");
        }
        if (!currencyRepo.existsById(dto.getCurrencyCode().toUpperCase())) {
            throw new IllegalArgumentException("Unknown currency: " + dto.getCurrencyCode());
        }
        if (productRepo.existsBySku(dto.getSku())) {
            throw new NameConflictException("SKU already exists: " + dto.getSku());
        }
        Product entity = mapper.toEntity(dto);
        Product saved = productRepo.save(entity);
        return mapper.toDto(saved);
    }

    public ProductDto update(Long id, ProductDto dto) {
        Product entity = productRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Product " + id + " not found"));

        if (!entity.getSku().equals(dto.getSku()) && productRepo.existsBySku(dto.getSku())) {
            throw new NameConflictException("SKU already exists: " + dto.getSku());
        }

        entity.setSku(dto.getSku());
        entity.setName(dto.getName());
        entity.setPriceCents(dto.getPriceCents());

        if (dto.getCurrencyCode() == null) {
            throw new IllegalArgumentException("currencyCode is required");
        }
        if (!currencyRepo.existsById(dto.getCurrencyCode().toUpperCase())) {
            throw new IllegalArgumentException("Unknown currency: " + dto.getCurrencyCode());
        }
        entity.setCurrencyCode(mapper.toCurrency(dto.getCurrencyCode()));

        Product saved = productRepo.save(entity);
        return mapper.toDto(saved);
    }
}

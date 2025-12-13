package com.example.minishop.service;

import com.example.minishop.api.ProductDto;
import com.example.minishop.domain.Product;
import com.example.minishop.repo.CurrencyRepository;
import com.example.minishop.repo.ProductRepository;
import com.example.minishop.web.mapper.ProductMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepo;
    private final CurrencyRepository currencyRepo;
    private final ProductMapper mapper;

    public List<ProductDto> findAll() {
        return mapper.toDto(productRepo.findAll());
    }

    @Transactional
    public ProductDto create(ProductDto dto) {
        // kontroll, et FK ei kukuks
        if (!currencyRepo.existsById(dto.getCurrencyCode().toUpperCase())) {
            throw new IllegalArgumentException("Unknown currency: " + dto.getCurrencyCode());
        }
        // SKU duplikaat → 409
        if (productRepo.existsBySku(dto.getSku())) {
            throw new NameConflictException("SKU already exists: " + dto.getSku());
            }
        Product entity = mapper.toEntity(dto); // id/createdAt/updatedAt ignoreeritakse
        Product saved = productRepo.save(entity);
        return mapper.toDto(saved);
    }

    @Transactional
    public ProductDto update(Long id, ProductDto dto) {
        Product entity = productRepo.findById(id)
                .orElseThrow(() -> new ChangeSetPersister.NotFoundException("Product " + id + " not found"));

        // väljad, mida lubame muuta
        if (!entity.getSku().equals(dto.getSku()) && productRepo.existsBySku(dto.getSku())) {
            throw new NameConflictException("SKU already exists: " + dto.getSku());
            }
        entity.setSku(dto.getSku());
        entity.setName(dto.getName());
        entity.setPriceCents(dto.getPriceCents());

        if (!currencyRepo.existsById(dto.getCurrencyCode().toUpperCase())) {
            throw new IllegalArgumentException("Unknown currency: " + dto.getCurrencyCode());
        }
        // mapperi abimeetod teeb Currency viite koodi põhjal
        entity.setCurrencyCode(mapper.toCurrency(dto.getCurrencyCode()));

        Product saved = productRepo.save(entity);
        return mapper.toDto(saved);
    }
}

package com.example.minishop.repo;

import com.example.minishop.domain.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsBySku(String sku);

    Page<Product> findByNameContainingIgnoreCaseOrSkuContainingIgnoreCase(
            String name, String sku, Pageable pageable
    );
}

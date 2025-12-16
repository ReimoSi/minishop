package com.example.minishop.repo;

import com.example.minishop.domain.Currency;
import com.example.minishop.domain.Product;
import com.example.minishop.testsupport.BasePostgresIntegration;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class ProductRepositorySearchIT extends BasePostgresIntegration {

    @Autowired
    ProductRepository productRepository;

    @PersistenceContext
    EntityManager em;

    @BeforeEach
    void seed() {
        Currency eur = em.getReference(Currency.class, "EUR");

        if (!productRepository.existsBySku("SKU-SAMSUNG-001")) {
            Product p1 = new Product();
            p1.setSku("SKU-SAMSUNG-001");
            p1.setName("SAMSUNG");
            p1.setPriceCents(1500);
            p1.setCurrencyCode(eur);
            em.persist(p1);
        }
        if (!productRepository.existsBySku("SKU-SAMSUNG-002")) {
            Product p2 = new Product();
            p2.setSku("SKU-SAMSUNG-002");
            p2.setName("SAMSUNG ULTRA S25");
            p2.setPriceCents(1600);
            p2.setCurrencyCode(eur);
            em.persist(p2);
        }
        em.flush();
    }

    @Test
    void search_byNameOrSku_returnsSamsung() {
        var pageable = org.springframework.data.domain.PageRequest.of(
                0, 10,
                org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Order.desc("priceCents"),
                        org.springframework.data.domain.Sort.Order.asc("id")
                )
        );

        var page = productRepository
                .findByNameContainingIgnoreCaseOrSkuContainingIgnoreCase("sam", "sam", pageable);

        assertThat(page.getTotalElements()).isGreaterThanOrEqualTo(2);
        assertThat(page.getContent().get(0).getPriceCents()).isEqualTo(1600);
    }
}

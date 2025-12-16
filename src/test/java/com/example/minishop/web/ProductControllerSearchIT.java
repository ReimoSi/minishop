package com.example.minishop.web;

import com.example.minishop.domain.Currency;
import com.example.minishop.domain.Product;
import com.example.minishop.repo.ProductRepository;
import com.example.minishop.testsupport.BasePostgresIntegration;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.client.RestClient;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ProductControllerSearchIT extends BasePostgresIntegration {

    @LocalServerPort
    int port;

    @Autowired
    ProductRepository productRepository;

    @PersistenceContext
    EntityManager em;

    @Autowired
    PlatformTransactionManager txManager;

    @BeforeEach
    void seedCommitted() {
        // Commiti seed eraldi transaktsioonis, et HTTP thread seda näeks
        new TransactionTemplate(txManager).execute(status -> {
            Currency eur = em.getReference(Currency.class, "EUR");

            if (!productRepository.existsBySku("SKU-SAMSUNG-001")) {
                Product p1 = new Product();
                p1.setSku("SKU-SAMSUNG-001");
                p1.setName("SAMSUNG");
                p1.setPriceCents(1500);
                p1.setCurrencyCode(eur);
                productRepository.save(p1);
            }
            if (!productRepository.existsBySku("SKU-SAMSUNG-002")) {
                Product p2 = new Product();
                p2.setSku("SKU-SAMSUNG-002");
                p2.setName("SAMSUNG ULTRA S25");
                p2.setPriceCents(1600);
                p2.setCurrencyCode(eur);
                productRepository.save(p2);
            }
            em.flush();
            return null;
        });
    }

    @Test
    void search_q_sam_sortedByPriceDesc_then1600First() {
        RestClient client = RestClient.builder()
                .baseUrl("http://localhost:" + port)
                .build();

        ResponseEntity<Map<String, Object>> resp = client.get()
                .uri("/api/products?q=sam&size=10&sort=price,desc")
                .exchange((req, res) -> {
                    Map<String, Object> body = null;
                    try (InputStream is = res.getBody()) {
                        if (is != null) {
                            body = new ObjectMapper().readValue(is, new TypeReference<>() {});
                        }
                    }
                    return ResponseEntity.status(res.getStatusCode())
                            .headers(res.getHeaders())
                            .body(body);
                });

        assertThat(resp.getStatusCode().value()).isEqualTo(200);
        Map<String, Object> body = resp.getBody();
        assertThat(body).isNotNull();

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> content = (List<Map<String, Object>>) body.get("content");
        assertThat(content).isNotEmpty();

        Number price0 = (Number) content.get(0).get("priceCents");
        assertThat(price0.intValue()).isEqualTo(1600);
    }
}

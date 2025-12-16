package com.example.minishop.web;

import com.example.minishop.testsupport.BasePostgresIntegration;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClient;

import java.io.InputStream;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ProductControllerSortValidationIT extends BasePostgresIntegration {

    @LocalServerPort
    int port;

    @Test
    void invalidSortKey_returns400_withPayload() {
        RestClient client = RestClient.builder()
                .baseUrl("http://localhost:" + port)
                .build();

        ResponseEntity<Map<String, Object>> resp = client.get()
                .uri("/api/products?sort=hacker")
                .exchange((req, res) -> {
                    // EI viska 4xx korral – loeme ise keha
                    Map<String, Object> body = null;
                    try (InputStream is = res.getBody()) {
                        if (is != null) {
                            body = new ObjectMapper().readValue(is, new TypeReference<Map<String, Object>>() {});
                        }
                    }
                    return ResponseEntity.status(res.getStatusCode())
                            .headers(res.getHeaders())
                            .body(body);
                });

        assertThat(resp.getStatusCode().value()).isEqualTo(400);
        Map<String, Object> body = resp.getBody();
        assertThat(body).isNotNull();
        assertThat(body.get("code")).isEqualTo("VALIDATION_FAILED");
        assertThat(String.valueOf(body.get("message"))).contains("Unsupported sort");
    }
}

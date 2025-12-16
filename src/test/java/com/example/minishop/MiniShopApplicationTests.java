package com.example.minishop;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@Testcontainers
class MiniShopApplicationTests {

    @Container
    static final PostgreSQLContainer<?> pg = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("minishop_test")
            .withUsername("minishop")
            .withPassword("minipassword");

    @DynamicPropertySource
    static void registerPgProps(DynamicPropertyRegistry r) {
        // DataSource
        r.add("spring.datasource.url", pg::getJdbcUrl);
        r.add("spring.datasource.username", pg::getUsername);
        r.add("spring.datasource.password", pg::getPassword);
        r.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");

        // Alati lae schema.sql + data.sql testis
        r.add("spring.sql.init.mode", () -> "always");
        r.add("spring.sql.init.schema-locations", () -> "classpath:/schema.sql");
        r.add("spring.sql.init.data-locations", () -> "classpath:/data.sql");
        r.add("spring.sql.init.continue-on-error", () -> "true");
        r.add("spring.jpa.defer-datasource-initialization", () -> "true");

        // Hibernate ei valideeri/ei loo skeemi testis
        r.add("spring.jpa.hibernate.ddl-auto", () -> "none");
        r.add("spring.jpa.properties.hibernate.hbm2ddl.auto", () -> "none");

        // Keelame Liquibase testides (meil pole skeemi changelogis)
        r.add("spring.liquibase.enabled", () -> "false");

        // Ühtlane skeem/ajavöönd (valikuline)
        r.add("spring.jpa.properties.hibernate.default_schema", () -> "public");
        r.add("spring.jpa.properties.hibernate.jdbc.time_zone", () -> "UTC");
    }

    @Test
    void contextLoads() { }
}

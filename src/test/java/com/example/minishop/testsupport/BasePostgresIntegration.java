package com.example.minishop.testsupport;

import org.junit.jupiter.api.BeforeAll;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
public abstract class BasePostgresIntegration {

    @Container
    @SuppressWarnings("resource")
    static final PostgreSQLContainer<?> PG =
            new PostgreSQLContainer<>("postgres:16-alpine")
                    .withDatabaseName("minishop_test")
                    .withUsername("minishop")
                    .withPassword("minipassword");

    @BeforeAll
    static void start() {
        // Container starter käib @Container kaudu; @BeforeAll hoiab IDE hoiatuse eemal.
    }

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", PG::getJdbcUrl);
        r.add("spring.datasource.username", PG::getUsername);
        r.add("spring.datasource.password", PG::getPassword);
        r.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");

        // Testis kasutame schema.sql + data.sql (mitte Liquibase)
        r.add("spring.sql.init.mode", () -> "always");
        r.add("spring.sql.init.schema-locations", () -> "classpath:/schema.sql");
        r.add("spring.sql.init.data-locations", () -> "classpath:/data.sql");
        r.add("spring.sql.init.continue-on-error", () -> "true");

        // Hibernate ei muuda skeemi
        r.add("spring.jpa.hibernate.ddl-auto", () -> "none");
        r.add("spring.jpa.properties.hibernate.hbm2ddl.auto", () -> "none");
        r.add("spring.jpa.defer-datasource-initialization", () -> "true");

        // Keelame Liquibase testis
        r.add("spring.liquibase.enabled", () -> "false");

        // Ühtlane ajavöönd
        r.add("spring.jpa.properties.hibernate.jdbc.time_zone", () -> "UTC");
    }
}

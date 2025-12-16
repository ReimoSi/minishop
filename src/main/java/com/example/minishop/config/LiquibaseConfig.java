package com.example.minishop.config;

import javax.sql.DataSource;
import liquibase.integration.spring.SpringLiquibase;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(
        prefix = "spring.liquibase",
        name = "enabled",
        havingValue = "true",
        matchIfMissing = true
)
public class LiquibaseConfig {

    @Bean
    public SpringLiquibase liquibase(DataSource dataSource) {
        SpringLiquibase lb = new SpringLiquibase();
        lb.setDataSource(dataSource);
        lb.setChangeLog("classpath:db/changelog/db.changelog-master.yaml");
        lb.setContexts("dev,prod");
        lb.setShouldRun(true);
        return lb;
    }
}


package com.example.minishop.config;

import javax.sql.DataSource;
import liquibase.integration.spring.SpringLiquibase;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LiquibaseConfig {

    @Bean
    public SpringLiquibase liquibase(DataSource dataSource) {
        SpringLiquibase lb = new SpringLiquibase();
        lb.setDataSource(dataSource);
        // NB: path vastab sellele, mis JAR-is on
        lb.setChangeLog("classpath:db/changelog/db.changelog-master.yaml");
        // kui .sql changesetitel on context: dev,prod, hoia need peal;
        // kui eemaldad context'id failidest, võid selle rea ära jätta.
        lb.setContexts("dev,prod");
        lb.setShouldRun(true);
        return lb;
    }
}

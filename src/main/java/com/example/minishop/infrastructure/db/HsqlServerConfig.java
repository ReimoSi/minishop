package com.example.minishop.infrastructure.db;

import org.hsqldb.server.Server;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.jdbc.autoconfigure.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;

import javax.sql.DataSource;

@Configuration
public class HsqlServerConfig {
    private static final Logger log = LoggerFactory.getLogger(HsqlServerConfig.class);

    /**
     * Käivitab HSQLDB TCP serveri port 9001.
     * DB nimi: "minishop", tee: file:./localdb/minishop  (püsiv failibaas).
     * IntelliJ URL: jdbc:hsqldb:hsql://localhost:9001/minishop  (User=SA, Password=tühi)
     */
    @Bean(initMethod = "start", destroyMethod = "stop", name = "hsqlServer")
    public Server hsqlServer() {
        Server server = new Server();
        server.setLogWriter(null);
        server.setSilent(true);
        server.setPort(9001);
        server.setDatabaseName(0, "minishop");
        server.setDatabasePath(0, "file:./localdb/minishop");
        log.info("Starting HSQLDB server on port 9001 (dbName=minishop, path=file:./localdb/minishop)");
        return server;
        }

        /**
         * Tee DataSource sõltuvaks hsqlServer-ist, et server oleks kindlasti käima läinud,
         * enne kui Spring üritab DB-ga ühendada.
         */
    @Bean
    @DependsOn("hsqlServer")
    public DataSource dataSource(DataSourceProperties props) {
        return props.initializeDataSourceBuilder().build();
    }
}

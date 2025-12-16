--liquibase formatted sql
--changeset reimo:pg-trgm-ext
CREATE EXTENSION IF NOT EXISTS pg_trgm;
--rollback DO $$ BEGIN END $$;

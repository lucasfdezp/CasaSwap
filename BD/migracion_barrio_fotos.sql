-- ─────────────────────────────────────────────────────────────────────────
--  Migración: Añade barrio y fotos a la tabla casas
--  Ejecutar una sola vez en phpMyAdmin o con MySQL CLI
-- ─────────────────────────────────────────────────────────────────────────

USE casaswap;

-- Añadir columna barrio (opcional, tras ciudad)
ALTER TABLE casas
  ADD COLUMN barrio VARCHAR(100) NULL AFTER ciudad;

-- Añadir columna fotos (JSON como TEXT, opcional)
ALTER TABLE casas
  ADD COLUMN fotos TEXT NULL AFTER imagen_url;

-- Confirmar estructura
DESCRIBE casas;

-- ============================================================
--  CasaSwap · INSTALACIÓN COMPLETA DE EXTRAS (todo en uno)
--  Ejecutar UNA vez sobre la base de datos `casaswap` ya creada.
--  Es idempotente (IF NOT EXISTS): puedes ejecutarlo sin miedo
--  aunque ya hubieras corrido alguna migración antes.
--  Requiere MariaDB (el que trae XAMPP) -> soporta IF NOT EXISTS.
-- ============================================================

USE casaswap;

-- ── 1. USUARIOS: saldo de puntos ───────────────────────────
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS puntos INT NOT NULL DEFAULT 50 AFTER provincia;

UPDATE usuarios SET puntos = 50 WHERE puntos IS NULL OR puntos = 0;

-- ── 2. CASAS: barrio + fotos (multifoto) ───────────────────
ALTER TABLE casas
  ADD COLUMN IF NOT EXISTS barrio VARCHAR(100) NULL AFTER ciudad,
  ADD COLUMN IF NOT EXISTS fotos  TEXT         NULL AFTER imagen_url;

-- ── 3. CASAS: atributos + sistema de puntos ────────────────
ALTER TABLE casas
  ADD COLUMN IF NOT EXISTS acepta_mascotas         TINYINT(1) NOT NULL DEFAULT 0 AFTER capacidad,
  ADD COLUMN IF NOT EXISTS tiene_piscina           TINYINT(1) NOT NULL DEFAULT 0 AFTER acepta_mascotas,
  ADD COLUMN IF NOT EXISTS tiene_patio             TINYINT(1) NOT NULL DEFAULT 0 AFTER tiene_piscina,
  ADD COLUMN IF NOT EXISTS fecha_disponible_inicio DATE       NULL              AFTER tiene_patio,
  ADD COLUMN IF NOT EXISTS fecha_disponible_fin    DATE       NULL              AFTER fecha_disponible_inicio,
  ADD COLUMN IF NOT EXISTS puntos_base             INT        NOT NULL DEFAULT 0 AFTER fecha_disponible_fin,
  ADD COLUMN IF NOT EXISTS valor_puntos            INT        NOT NULL DEFAULT 0 AFTER puntos_base;

-- ── 4. SOLICITUDES de alquiler (flujo con aprobación) ──────
CREATE TABLE IF NOT EXISTS solicitudes (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  casa_id           INT UNSIGNED NOT NULL,
  inquilino_id      INT UNSIGNED NOT NULL,
  propietario_id    INT UNSIGNED NOT NULL,
  puntos            INT NOT NULL,
  fecha_inicio      DATE NULL,
  fecha_fin         DATE NULL,
  mensaje           TEXT NULL,
  estado            ENUM('pendiente','aceptada','rechazada','cancelada')
                    NOT NULL DEFAULT 'pendiente',
  fecha_solicitud   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_resolucion  DATETIME NULL,
  CONSTRAINT fk_sol_casa        FOREIGN KEY (casa_id)        REFERENCES casas(id)    ON DELETE CASCADE,
  CONSTRAINT fk_sol_inquilino   FOREIGN KEY (inquilino_id)   REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_sol_propietario FOREIGN KEY (propietario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 5. Fotos reales + barrios de las 4 casas de ejemplo ────
UPDATE casas SET
  barrio     = 'Santa Cruz',
  direccion  = 'Calle Sierpes 12, 3º',
  imagen_url = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200',
  fotos      = JSON_ARRAY(
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200',
    'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=1200',
    'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200'),
  tiene_patio = 1, acepta_mascotas = 1
WHERE id = 1;

UPDATE casas SET
  barrio     = 'Abando',
  direccion  = 'Avenida Abandoibarra 8, 5º B',
  imagen_url = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200',
  fotos      = JSON_ARRAY(
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200')
WHERE id = 2;

UPDATE casas SET
  barrio     = 'El Retiro',
  direccion  = 'Calle de Alcalá 45, 2º Izq',
  imagen_url = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200',
  fotos      = JSON_ARRAY(
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200',
    'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200',
    'https://images.unsplash.com/photo-1506126279646-a697353d3166?w=1200',
    'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=1200'),
  tiene_piscina = 1
WHERE id = 3;

UPDATE casas SET
  barrio     = 'Barceloneta',
  direccion  = 'Passeig Marítim 77, 1º Mar',
  imagen_url = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
  fotos      = JSON_ARRAY(
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
    'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200',
    'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200',
    'https://images.unsplash.com/photo-1569152811536-fb47aced8409?w=1200'),
  tiene_piscina = 1, tiene_patio = 1, acepta_mascotas = 1
WHERE id = 4;

-- ── 6. Recalcular puntos de TODAS las casas ────────────────
UPDATE casas SET
  puntos_base = (
      CASE tipo_vivienda
        WHEN 'piso'        THEN 20
        WHEN 'apartamento' THEN 25
        WHEN 'casa'        THEN 35
        WHEN 'chalet'      THEN 50
        ELSE 20
      END
      + (num_habitaciones * 8)
      + (capacidad * 4)
      + (tiene_piscina   * 30)
      + (tiene_patio     * 15)
      + (acepta_mascotas * 5)
      + (CASE WHEN ciudad IN ('Madrid','Barcelona','Sevilla','Bilbao','Valencia','Málaga','San Sebastián','Donostia')
              THEN 20 ELSE 0 END)
  )
WHERE 1;

UPDATE casas SET valor_puntos = puntos_base WHERE valor_puntos = 0;

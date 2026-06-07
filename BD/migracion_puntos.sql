-- ============================================================
--  CasaSwap · Migración: SISTEMA DE PUNTOS (moneda interna)
--  + atributos de casa (mascotas, piscina, patio, fechas)
--  + tabla de solicitudes de alquiler (con aprobación)
--  Ejecutar en phpMyAdmin o MySQL Workbench
-- ============================================================

-- ── 1. USUARIOS: saldo de puntos ───────────────────────────
ALTER TABLE usuarios
  ADD COLUMN puntos INT NOT NULL DEFAULT 50 AFTER provincia;

-- Los usuarios existentes arrancan con 50 puntos
UPDATE usuarios SET puntos = 50 WHERE puntos IS NULL OR puntos = 0;

-- ── 2. CASAS: nuevos atributos ─────────────────────────────
ALTER TABLE casas
  ADD COLUMN acepta_mascotas         TINYINT(1) NOT NULL DEFAULT 0 AFTER capacidad,
  ADD COLUMN tiene_piscina           TINYINT(1) NOT NULL DEFAULT 0 AFTER acepta_mascotas,
  ADD COLUMN tiene_patio             TINYINT(1) NOT NULL DEFAULT 0 AFTER tiene_piscina,
  ADD COLUMN fecha_disponible_inicio DATE       NULL          AFTER tiene_patio,
  ADD COLUMN fecha_disponible_fin    DATE       NULL          AFTER fecha_disponible_inicio,
  ADD COLUMN puntos_base             INT        NOT NULL DEFAULT 0 AFTER fecha_disponible_fin,
  ADD COLUMN valor_puntos            INT        NOT NULL DEFAULT 0 AFTER puntos_base;

-- ── 3. SOLICITUDES de alquiler (flujo con aprobación) ──────
CREATE TABLE IF NOT EXISTS solicitudes (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  casa_id           INT UNSIGNED NOT NULL,
  inquilino_id      INT UNSIGNED NOT NULL,         -- quien solicita / paga puntos
  propietario_id    INT UNSIGNED NOT NULL,         -- quien recibe los puntos
  puntos            INT NOT NULL,                  -- coste congelado en el momento de solicitar
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

-- ── 4. Recalcular puntos_base / valor_puntos de las casas existentes ──
--    Fórmula (igual que en el backend PHP calcularPuntosBase):
--      base por tipo + habitaciones*8 + capacidad*4
--      + piscina(30) + patio(15) + mascotas(5) + ciudad premium(20)
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

-- Por defecto el valor final = base (sin ajuste manual)
UPDATE casas SET valor_puntos = puntos_base WHERE valor_puntos = 0;

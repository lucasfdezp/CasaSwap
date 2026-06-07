-- ============================================================
--  CasaSwap · Corrige los datos de las 4 casas de ejemplo
--  - Atributos coherentes con el tipo de vivienda
--  - Fotos acordes (interiores para pisos, exterior+piscina chalet)
--  - Fechas de disponibilidad (para que se vean en el detalle)
--  Ejecutar sobre la base de datos `casaswap`.
-- ============================================================

USE casaswap;

-- ── CASA 1 · PISO céntrico en Sevilla (2 hab, 4 pers) ──────
--    Piso en pleno centro: SIN piscina, SIN patio. Admite mascotas.
UPDATE casas SET
  barrio                  = 'Santa Cruz',
  direccion               = 'Calle Sierpes 12, 3º B',
  descripcion             = 'Piso de 2 habitaciones en pleno barrio de Santa Cruz, a 5 minutos andando de la Catedral y la Giralda. Totalmente reformado y equipado: cocina completa, aire acondicionado (imprescindible en verano), WiFi de fibra y lavadora. El edificio dispone de ascensor. Ideal para parejas o familias pequeñas que quieran descubrir Sevilla a pie. Admite mascotas. Rodeado de bares de tapas, comercios y parada de tranvía a 50 m.',
  tipo_vivienda           = 'piso',
  tiene_piscina           = 0,
  tiene_patio             = 0,
  acepta_mascotas         = 1,
  fecha_disponible_inicio = '2026-06-15',
  fecha_disponible_fin    = '2026-09-30',
  imagen_url = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
  fotos = JSON_ARRAY(
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80',
    'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80',
    'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=1200&q=80')
WHERE id = 1;

-- ── CASA 2 · CASA con jardín en Bilbao (3 hab, 6 pers) ─────
--    Casa familiar con jardín: PATIO sí, piscina no, admite mascotas.
UPDATE casas SET
  barrio                  = 'Abando',
  direccion               = 'Avenida Abandoibarra 8',
  descripcion             = 'Casa familiar de 3 habitaciones con jardín privado y zona de barbacoa, situada en Abando a 10 minutos a pie del Museo Guggenheim. Amplio salón-comedor, 2 baños completos, cocina totalmente equipada y plaza de garaje. El jardín es perfecto para desayunar al aire libre o para que jueguen los niños. Admite mascotas. A pocos minutos del Casco Viejo y de la estación de metro. Capacidad para 6 personas.',
  tipo_vivienda           = 'casa',
  tiene_piscina           = 0,
  tiene_patio             = 1,
  acepta_mascotas         = 1,
  fecha_disponible_inicio = '2026-07-01',
  fecha_disponible_fin    = '2026-08-31',
  imagen_url = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80',
  fotos = JSON_ARRAY(
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80',
    'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=1200&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80')
WHERE id = 2;

-- ── CASA 3 · APARTAMENTO moderno en Madrid (1 hab, 2 pers) ─
--    Apartamento minimalista pequeño: SIN piscina, SIN patio, sin mascotas.
UPDATE casas SET
  barrio                  = 'El Retiro',
  direccion               = 'Calle de Alcalá 45, 2º A',
  descripcion             = 'Apartamento de diseño minimalista junto al Parque del Retiro, ideal para parejas o viajeros que buscan tranquilidad en pleno centro de Madrid. 1 dormitorio, baño completo y salón luminoso con cocina americana totalmente equipada. Calefacción, aire acondicionado y WiFi de alta velocidad. A 2 minutos del metro (línea 2) y rodeado de cafeterías y museos (Prado y Reina Sofía a 15 min). No se admiten mascotas.',
  tipo_vivienda           = 'apartamento',
  tiene_piscina           = 0,
  tiene_patio             = 0,
  acepta_mascotas         = 0,
  fecha_disponible_inicio = '2026-06-10',
  fecha_disponible_fin    = '2026-12-20',
  imagen_url = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
  fotos = JSON_ARRAY(
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80',
    'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80')
WHERE id = 3;

-- ── CASA 4 · CHALET con piscina en Barcelona (4 hab, 8 pers) ─
--    Chalet de lujo: PISCINA + TERRAZA/patio + admite mascotas.
UPDATE casas SET
  barrio                  = 'Barceloneta',
  direccion               = 'Passeig Marítim 77',
  descripcion             = 'Espectacular chalet de 4 habitaciones con piscina privada y amplia terraza con vistas al mar, a 10 minutos de la playa de la Barceloneta. Capacidad para 8 personas: 3 baños, salón de 40 m², cocina de lujo y barbacoa exterior. Jardín con zona chill-out y solárium junto a la piscina. Admite mascotas. Perfecto para familias o grupos de amigos que quieran combinar playa y ciudad. Incluye parking para 2 coches.',
  tipo_vivienda           = 'chalet',
  tiene_piscina           = 1,
  tiene_patio             = 1,
  acepta_mascotas         = 1,
  fecha_disponible_inicio = '2026-06-20',
  fecha_disponible_fin    = '2026-09-10',
  imagen_url = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
  fotos = JSON_ARRAY(
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80',
    'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1200&q=80',
    'https://images.unsplash.com/photo-1564501049412-3c9323ad6b6c?w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80')
WHERE id = 4;

-- ── Recalcular puntos con los atributos ya corregidos ─────
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

-- El valor final se iguala al base SOLO en las 4 casas originales (ids 1-4).
-- Así no pisamos los precios ajustados manualmente de otras casas (p.ej. la de 50 créditos).
UPDATE casas SET valor_puntos = puntos_base WHERE id BETWEEN 1 AND 4;

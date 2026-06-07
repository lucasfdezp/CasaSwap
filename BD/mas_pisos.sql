-- ============================================================
--  CasaSwap · Más pisos de ejemplo + propietario de prueba
--  Incluye una casa que cuesta EXACTAMENTE 50 créditos para
--  poder probar el sistema de puntos de principio a fin.
--  Se puede reejecutar sin duplicar (limpia antes por título).
-- ============================================================

USE casaswap;

-- ── Propietario de prueba (dueño de la casa de 50 créditos) ──
--    LOGIN:  demo@casaswap.com   ·   CONTRASEÑA: 1234
INSERT IGNORE INTO usuarios (nombre, apellidos, email, telefono, ciudad, provincia, puntos, password, fecha_registro)
VALUES ('Ana', 'Demo Torres', 'demo@casaswap.com', '600123123', 'Granada', 'Granada', 50, '1234', '2026-01-15');

-- Evitar duplicados si se reejecuta el script
DELETE FROM casas WHERE titulo IN (
  'Piso con encanto en el Albaicín',
  'Estudio luminoso en Zaragoza',
  'Piso reformado junto al río en Valencia',
  'Piso familiar en Alicante'
);

-- ── CASA DE 50 CRÉDITOS (propietario: demo@casaswap.com) ─────
--    piso · Granada (no premium) · 2 hab · 4 pers · admite mascotas
--    base = 20 + 16 + 16 + 5 = 57  ->  ajustado manualmente a 50
INSERT INTO casas
  (usuario_id, titulo, descripcion, direccion, ciudad, barrio, provincia,
   tipo_vivienda, num_habitaciones, capacidad,
   acepta_mascotas, tiene_piscina, tiene_patio,
   fecha_disponible_inicio, fecha_disponible_fin,
   puntos_base, valor_puntos, disponible, imagen_url, fotos, fecha_publicacion)
VALUES (
  (SELECT id FROM usuarios WHERE email = 'demo@casaswap.com'),
  'Piso con encanto en el Albaicín',
  'Piso de 2 habitaciones en el corazón del Albaicín, con vistas a la Alhambra desde el salón. Casa típica granadina reformada conservando su encanto: suelos de barro, vigas de madera y un pequeño balcón. Cocina equipada, WiFi y calefacción. A 10 minutos del Mirador de San Nicolás y de la zona de tapas. Admite mascotas. Perfecto para una escapada cultural por Granada.',
  'Cuesta del Chapiz 14', 'Granada', 'Albaicín', 'Granada',
  'piso', 2, 4,
  1, 0, 0,
  '2026-06-15', '2026-10-31',
  57, 50, 1,
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80',
  JSON_ARRAY(
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80',
    'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80'),
  '2026-05-20'
);

-- ── Estudio en Zaragoza (propietario: Pedro, id 3) · ~36 pts ─
INSERT INTO casas
  (usuario_id, titulo, descripcion, direccion, ciudad, barrio, provincia,
   tipo_vivienda, num_habitaciones, capacidad,
   acepta_mascotas, tiene_piscina, tiene_patio,
   fecha_disponible_inicio, fecha_disponible_fin,
   puntos_base, valor_puntos, disponible, imagen_url, fotos, fecha_publicacion)
VALUES (
  3,
  'Estudio luminoso en Zaragoza',
  'Estudio acogedor a 5 minutos de la Basílica del Pilar, ideal para una o dos personas. Espacio abierto con cama de matrimonio, cocina americana y baño completo reformado. Muy luminoso y silencioso. WiFi, aire acondicionado y calefacción. Zona céntrica con todos los servicios a mano y excelente conexión de autobús. No se admiten mascotas.',
  'Calle Alfonso I 30', 'Zaragoza', 'Casco Histórico', 'Zaragoza',
  'piso', 1, 2,
  0, 0, 0,
  '2026-06-01', '2026-12-15',
  36, 36, 1,
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
  JSON_ARRAY(
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80',
    'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80'),
  '2026-05-18'
);

-- ── Piso en Valencia (propietario: Carlos, id 1) · premium ───
--    piso · Valencia (premium +20) · 3 hab · 5 pers · mascotas
INSERT INTO casas
  (usuario_id, titulo, descripcion, direccion, ciudad, barrio, provincia,
   tipo_vivienda, num_habitaciones, capacidad,
   acepta_mascotas, tiene_piscina, tiene_patio,
   fecha_disponible_inicio, fecha_disponible_fin,
   puntos_base, valor_puntos, disponible, imagen_url, fotos, fecha_publicacion)
VALUES (
  1,
  'Piso reformado junto al río en Valencia',
  'Amplio piso de 3 habitaciones junto a los Jardines del Turia, ideal para familias. Salón espacioso, 2 baños, cocina office equipada y balcón. A 15 minutos de la Ciudad de las Artes y las Ciencias y bien comunicado con la playa de la Malvarrosa. WiFi, aire acondicionado en todas las estancias. Admite mascotas. Zona tranquila y residencial con parques cercanos.',
  'Carrer de Sant Vicent Màrtir 120', 'Valencia', 'L''Eixample', 'Valencia',
  'piso', 3, 5,
  1, 0, 0,
  '2026-07-01', '2026-09-30',
  81, 81, 1,
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
  JSON_ARRAY(
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80',
    'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80'),
  '2026-05-22'
);

-- ── Piso en Alicante (propietario: Lucía, id 4) · ~52 pts ────
INSERT INTO casas
  (usuario_id, titulo, descripcion, direccion, ciudad, barrio, provincia,
   tipo_vivienda, num_habitaciones, capacidad,
   acepta_mascotas, tiene_piscina, tiene_patio,
   fecha_disponible_inicio, fecha_disponible_fin,
   puntos_base, valor_puntos, disponible, imagen_url, fotos, fecha_publicacion)
VALUES (
  4,
  'Piso familiar en Alicante',
  'Piso de 2 habitaciones a 10 minutos a pie de la playa del Postiguet, en pleno centro de Alicante. Salón-comedor luminoso, cocina equipada y terraza con tendedero. Ideal para parejas o familias que quieran disfrutar del mar y del casco antiguo (Barrio de Santa Cruz y Castillo de Santa Bárbara). WiFi y aire acondicionado. No se admiten mascotas.',
  'Avenida de la Constitución 25', 'Alicante', 'Centro', 'Alicante',
  'piso', 2, 4,
  0, 0, 1,
  '2026-06-10', '2026-09-20',
  51, 51, 1,
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80',
  JSON_ARRAY(
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80',
    'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200&q=80'),
  '2026-05-25'
);

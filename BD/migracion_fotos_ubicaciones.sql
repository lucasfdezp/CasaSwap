-- ============================================================
--  CasaSwap · Migración: fotos múltiples + barrios reales
--  Ejecutar en phpMyAdmin o MySQL Workbench
-- ============================================================

-- ── CASA 1: Ático en el barrio de Santa Cruz, Sevilla ──────
UPDATE casas SET
  barrio      = 'Santa Cruz',
  direccion   = 'Calle Sierpes 12, 3º',
  imagen_url  = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200',
  fotos       = JSON_ARRAY(
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200',
    'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=1200',
    'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200'
  )
WHERE id = 1;

-- ── CASA 2: Piso moderno en Abando, Bilbao ─────────────────
UPDATE casas SET
  barrio      = 'Abando',
  direccion   = 'Avenida Abandoibarra 8, 5º B',
  imagen_url  = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200',
  fotos       = JSON_ARRAY(
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200'
  )
WHERE id = 2;

-- ── CASA 3: Piso amplio en el barrio del Retiro, Madrid ────
UPDATE casas SET
  barrio      = 'El Retiro',
  direccion   = 'Calle de Alcalá 45, 2º Izq',
  imagen_url  = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200',
  fotos       = JSON_ARRAY(
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200',
    'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200',
    'https://images.unsplash.com/photo-1506126279646-a697353d3166?w=1200',
    'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=1200'
  )
WHERE id = 3;

-- ── CASA 4: Apartamento vistas al mar, Barceloneta, BCN ────
UPDATE casas SET
  barrio      = 'Barceloneta',
  direccion   = 'Passeig Marítim 77, 1º Mar',
  imagen_url  = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
  fotos       = JSON_ARRAY(
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
    'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200',
    'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200',
    'https://images.unsplash.com/photo-1569152811536-fb47aced8409?w=1200'
  )
WHERE id = 4;

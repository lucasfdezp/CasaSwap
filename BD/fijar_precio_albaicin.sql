-- ============================================================
--  CasaSwap · Fija el precio del piso del Albaicín en 50 créditos
--  Ejecutar SIEMPRE EN ÚLTIMO LUGAR (después de los demás scripts).
-- ============================================================
USE casaswap;

UPDATE casas
SET valor_puntos = 50
WHERE titulo = 'Piso con encanto en el Albaicín';

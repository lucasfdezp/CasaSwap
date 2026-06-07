-- ============================================================
--  CasaSwap · INSTALACIÓN COMPLETA (esquema + datos finales)
--  Un solo archivo para montar la BD desde cero.
--  Útil para el despliegue en Railway (importar este y nada más).
-- ============================================================

CREATE DATABASE IF NOT EXISTS casaswap
  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE casaswap;

-- ── Limpieza (por si se reimporta) ──
DROP TABLE IF EXISTS solicitudes;
DROP TABLE IF EXISTS casas;
DROP TABLE IF EXISTS usuarios;

-- ── USUARIOS ──
CREATE TABLE usuarios (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(80)  NOT NULL,
  apellidos  VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  telefono   VARCHAR(20),
  ciudad     VARCHAR(80),
  provincia  VARCHAR(80),
  puntos     INT NOT NULL DEFAULT 50,
  password   VARCHAR(255) NOT NULL,
  fecha_registro DATE,
  UNIQUE INDEX (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── CASAS ──
CREATE TABLE casas (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  usuario_id       INT UNSIGNED NOT NULL,
  titulo           VARCHAR(150) NOT NULL,
  descripcion      TEXT,
  direccion        VARCHAR(255),
  ciudad           VARCHAR(80)  NOT NULL,
  barrio           VARCHAR(100),
  provincia        VARCHAR(80)  NOT NULL,
  tipo_vivienda    ENUM('piso','casa','chalet','apartamento') DEFAULT 'piso',
  num_habitaciones INT DEFAULT 1,
  capacidad        INT DEFAULT 2,
  acepta_mascotas  TINYINT(1) NOT NULL DEFAULT 0,
  tiene_piscina    TINYINT(1) NOT NULL DEFAULT 0,
  tiene_patio      TINYINT(1) NOT NULL DEFAULT 0,
  fecha_disponible_inicio DATE NULL,
  fecha_disponible_fin    DATE NULL,
  puntos_base      INT NOT NULL DEFAULT 0,
  valor_puntos     INT NOT NULL DEFAULT 0,
  disponible       TINYINT(1) DEFAULT 1,
  imagen_url       VARCHAR(255),
  fotos            TEXT,
  fecha_publicacion DATE,
  INDEX (provincia), INDEX (ciudad),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── SOLICITUDES ──
CREATE TABLE solicitudes (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  casa_id          INT UNSIGNED NOT NULL,
  inquilino_id     INT UNSIGNED NOT NULL,
  propietario_id   INT UNSIGNED NOT NULL,
  puntos           INT NOT NULL,
  fecha_inicio     DATE NULL,
  fecha_fin        DATE NULL,
  mensaje          TEXT NULL,
  estado           ENUM('pendiente','aceptada','rechazada','cancelada') NOT NULL DEFAULT 'pendiente',
  fecha_solicitud  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_resolucion DATETIME NULL,
  FOREIGN KEY (casa_id)        REFERENCES casas(id)    ON DELETE CASCADE,
  FOREIGN KEY (inquilino_id)   REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (propietario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── USUARIOS (datos) ── contraseña de todos: 1234
INSERT INTO usuarios (nombre, apellidos, email, telefono, ciudad, provincia, puntos, password, fecha_registro) VALUES
('Carlos','García López',   'carlos@ejemplo.com', '600111222','Sevilla',  'Sevilla',  50,'1234','2025-01-10'),
('María', 'Fernández Ruiz', 'maria@ejemplo.com',  '600333444','Bilbao',   'Vizcaya',  50,'1234','2025-02-15'),
('Pedro', 'Martínez Sanz',  'pedro@ejemplo.com',  '600555666','Madrid',   'Madrid',   50,'1234','2025-03-20'),
('Lucía', 'Pérez Vega',     'lucia@ejemplo.com',  '600777888','Barcelona','Barcelona',50,'1234','2025-04-05'),
('Ana',   'Demo Torres',    'demo@casaswap.com',  '600123123','Granada',  'Granada',  50,'1234','2026-01-15');

-- ── CASAS (datos finales y coherentes) ──
-- 1 · Piso Sevilla (Carlos) · 77 pts
INSERT INTO casas (usuario_id,titulo,descripcion,direccion,ciudad,barrio,provincia,tipo_vivienda,num_habitaciones,capacidad,acepta_mascotas,tiene_piscina,tiene_patio,fecha_disponible_inicio,fecha_disponible_fin,puntos_base,valor_puntos,disponible,imagen_url,fotos,fecha_publicacion) VALUES
(1,'Piso céntrico en Sevilla',
 'Piso de 2 habitaciones en pleno barrio de Santa Cruz, a 5 minutos andando de la Catedral y la Giralda. Totalmente reformado y equipado: cocina completa, aire acondicionado, WiFi de fibra y lavadora. Edificio con ascensor. Ideal para parejas o familias pequeñas. Admite mascotas. Rodeado de bares de tapas y parada de tranvía.',
 'Calle Sierpes 12, 3º B','Sevilla','Santa Cruz','Sevilla','piso',2,4,1,0,0,'2026-06-15','2026-09-30',77,77,1,
 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
 JSON_ARRAY('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80','https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80','https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80','https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200&q=80','https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80','https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=1200&q=80'),
 '2025-01-12');

-- 2 · Casa con jardín Bilbao (María) · 123 pts
INSERT INTO casas (usuario_id,titulo,descripcion,direccion,ciudad,barrio,provincia,tipo_vivienda,num_habitaciones,capacidad,acepta_mascotas,tiene_piscina,tiene_patio,fecha_disponible_inicio,fecha_disponible_fin,puntos_base,valor_puntos,disponible,imagen_url,fotos,fecha_publicacion) VALUES
(2,'Casa con jardín en Bilbao',
 'Casa familiar de 3 habitaciones con jardín privado y zona de barbacoa, en Abando a 10 minutos a pie del Museo Guggenheim. Amplio salón-comedor, 2 baños, cocina equipada y plaza de garaje. Jardín perfecto para los niños. Admite mascotas. A pocos minutos del Casco Viejo y del metro. Capacidad para 6 personas.',
 'Avenida Abandoibarra 8','Bilbao','Abando','Vizcaya','casa',3,6,1,0,1,'2026-07-01','2026-08-31',123,123,1,
 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80',
 JSON_ARRAY('https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80','https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80','https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=1200&q=80','https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80','https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80','https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80'),
 '2025-02-18');

-- 3 · Apartamento Madrid (Pedro) · 61 pts
INSERT INTO casas (usuario_id,titulo,descripcion,direccion,ciudad,barrio,provincia,tipo_vivienda,num_habitaciones,capacidad,acepta_mascotas,tiene_piscina,tiene_patio,fecha_disponible_inicio,fecha_disponible_fin,puntos_base,valor_puntos,disponible,imagen_url,fotos,fecha_publicacion) VALUES
(3,'Apartamento moderno en Madrid',
 'Apartamento de diseño minimalista junto al Parque del Retiro, ideal para parejas. 1 dormitorio, baño completo y salón con cocina americana equipada. Calefacción, aire acondicionado y WiFi. A 2 minutos del metro (línea 2) y rodeado de cafeterías y museos (Prado y Reina Sofía). No admite mascotas.',
 'Calle de Alcalá 45, 2º A','Madrid','El Retiro','Madrid','apartamento',1,2,0,0,0,'2026-06-10','2026-12-20',61,61,1,
 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
 JSON_ARRAY('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80','https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80','https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80','https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200&q=80','https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80'),
 '2025-03-22');

-- 4 · Chalet con piscina Barcelona (Lucía) · 184 pts
INSERT INTO casas (usuario_id,titulo,descripcion,direccion,ciudad,barrio,provincia,tipo_vivienda,num_habitaciones,capacidad,acepta_mascotas,tiene_piscina,tiene_patio,fecha_disponible_inicio,fecha_disponible_fin,puntos_base,valor_puntos,disponible,imagen_url,fotos,fecha_publicacion) VALUES
(4,'Chalet con piscina en Barcelona',
 'Espectacular chalet de 4 habitaciones con piscina privada y amplia terraza con vistas al mar, a 10 minutos de la playa de la Barceloneta. Capacidad para 8 personas: 3 baños, salón de 40 m², cocina de lujo y barbacoa. Jardín con zona chill-out. Admite mascotas. Perfecto para familias o grupos. Incluye parking para 2 coches.',
 'Passeig Marítim 77','Barcelona','Barceloneta','Barcelona','chalet',4,8,1,1,1,'2026-06-20','2026-09-10',184,184,1,
 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
 JSON_ARRAY('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80','https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80','https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1200&q=80','https://images.unsplash.com/photo-1564501049412-3c9323ad6b6c?w=1200&q=80','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80','https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80'),
 '2025-04-08');

-- 5 · Piso Albaicín Granada (Ana Demo) · 50 pts (ajuste manual sobre base 57)
INSERT INTO casas (usuario_id,titulo,descripcion,direccion,ciudad,barrio,provincia,tipo_vivienda,num_habitaciones,capacidad,acepta_mascotas,tiene_piscina,tiene_patio,fecha_disponible_inicio,fecha_disponible_fin,puntos_base,valor_puntos,disponible,imagen_url,fotos,fecha_publicacion) VALUES
(5,'Piso con encanto en el Albaicín',
 'Piso de 2 habitaciones en el corazón del Albaicín, con vistas a la Alhambra desde el salón. Casa típica granadina reformada conservando su encanto: suelos de barro, vigas de madera y un pequeño balcón. Cocina equipada, WiFi y calefacción. A 10 minutos del Mirador de San Nicolás. Admite mascotas. Perfecto para una escapada cultural.',
 'Cuesta del Chapiz 14','Granada','Albaicín','Granada','piso',2,4,1,0,0,'2026-06-15','2026-10-31',57,50,1,
 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80',
 JSON_ARRAY('https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80','https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80','https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80','https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200&q=80','https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80'),
 '2026-05-20');

-- 6 · Estudio Zaragoza (Pedro) · 36 pts
INSERT INTO casas (usuario_id,titulo,descripcion,direccion,ciudad,barrio,provincia,tipo_vivienda,num_habitaciones,capacidad,acepta_mascotas,tiene_piscina,tiene_patio,fecha_disponible_inicio,fecha_disponible_fin,puntos_base,valor_puntos,disponible,imagen_url,fotos,fecha_publicacion) VALUES
(3,'Estudio luminoso en Zaragoza',
 'Estudio acogedor a 5 minutos de la Basílica del Pilar, ideal para una o dos personas. Espacio abierto con cama de matrimonio, cocina americana y baño completo reformado. Muy luminoso y silencioso. WiFi, aire acondicionado y calefacción. Zona céntrica con todos los servicios. No admite mascotas.',
 'Calle Alfonso I 30','Zaragoza','Casco Histórico','Zaragoza','piso',1,2,0,0,0,'2026-06-01','2026-12-15',36,36,1,
 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
 JSON_ARRAY('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80','https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80','https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200&q=80','https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80'),
 '2026-05-18');

-- 7 · Piso Valencia (Carlos) · 89 pts
INSERT INTO casas (usuario_id,titulo,descripcion,direccion,ciudad,barrio,provincia,tipo_vivienda,num_habitaciones,capacidad,acepta_mascotas,tiene_piscina,tiene_patio,fecha_disponible_inicio,fecha_disponible_fin,puntos_base,valor_puntos,disponible,imagen_url,fotos,fecha_publicacion) VALUES
(1,'Piso reformado junto al río en Valencia',
 'Amplio piso de 3 habitaciones junto a los Jardines del Turia, ideal para familias. Salón espacioso, 2 baños, cocina office equipada y balcón. A 15 minutos de la Ciudad de las Artes y las Ciencias y bien comunicado con la playa de la Malvarrosa. WiFi y aire acondicionado. Admite mascotas. Zona tranquila con parques cercanos.',
 'Carrer de Sant Vicent Màrtir 120','Valencia','L''Eixample','Valencia','piso',3,5,1,0,0,'2026-07-01','2026-09-30',89,89,1,
 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
 JSON_ARRAY('https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80','https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80','https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80','https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200&q=80','https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80'),
 '2026-05-22');

-- 8 · Piso Alicante (Lucía) · 67 pts
INSERT INTO casas (usuario_id,titulo,descripcion,direccion,ciudad,barrio,provincia,tipo_vivienda,num_habitaciones,capacidad,acepta_mascotas,tiene_piscina,tiene_patio,fecha_disponible_inicio,fecha_disponible_fin,puntos_base,valor_puntos,disponible,imagen_url,fotos,fecha_publicacion) VALUES
(4,'Piso familiar en Alicante',
 'Piso de 2 habitaciones a 10 minutos a pie de la playa del Postiguet, en pleno centro de Alicante. Salón-comedor luminoso, cocina equipada y terraza con tendedero. Ideal para parejas o familias que quieran disfrutar del mar y del casco antiguo. WiFi y aire acondicionado. No admite mascotas.',
 'Avenida de la Constitución 25','Alicante','Centro','Alicante','piso',2,4,0,0,1,'2026-06-10','2026-09-20',67,67,1,
 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80',
 JSON_ARRAY('https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80','https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80','https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80','https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200&q=80'),
 '2026-05-25');

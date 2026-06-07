CREATE DATABASE IF NOT EXISTS casaswap
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE casaswap;

CREATE TABLE IF NOT EXISTS usuarios (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(80)  NOT NULL,
  apellidos  VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  telefono   VARCHAR(20),
  ciudad     VARCHAR(80),
  provincia  VARCHAR(80),
  password   VARCHAR(255) NOT NULL,
  fecha_registro DATE,
  UNIQUE INDEX (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS casas (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  usuario_id       INT UNSIGNED NOT NULL,
  titulo           VARCHAR(150) NOT NULL,
  descripcion      TEXT,
  direccion        VARCHAR(255),
  ciudad           VARCHAR(80)  NOT NULL,
  provincia        VARCHAR(80)  NOT NULL,
  tipo_vivienda    ENUM('piso','casa','chalet','apartamento') DEFAULT 'piso',
  num_habitaciones INT  DEFAULT 1,
  capacidad        INT  DEFAULT 2,
  disponible       TINYINT(1) DEFAULT 1,
  imagen_url       VARCHAR(255),
  fecha_publicacion DATE,
  INDEX (provincia),
  INDEX (ciudad),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Datos de prueba
INSERT INTO usuarios (nombre, apellidos, email, telefono, ciudad, provincia, password, fecha_registro) VALUES
('Carlos',  'García López',   'carlos@ejemplo.com',  '600111222', 'Sevilla',   'Sevilla',   '1234', '2025-01-10'),
('María',   'Fernández Ruiz', 'maria@ejemplo.com',   '600333444', 'Bilbao',    'Vizcaya',   '1234', '2025-02-15'),
('Pedro',   'Martínez Sanz',  'pedro@ejemplo.com',   '600555666', 'Madrid',    'Madrid',    '1234', '2025-03-20'),
('Lucía',   'Pérez Vega',     'lucia@ejemplo.com',   '600777888', 'Barcelona', 'Barcelona', '1234', '2025-04-05');

INSERT INTO casas (usuario_id, titulo, descripcion, direccion, ciudad, provincia, tipo_vivienda, num_habitaciones, capacidad, disponible, imagen_url, fecha_publicacion) VALUES
(1, 'Piso céntrico en Sevilla',
    'Acogedor piso a 5 min de la Catedral de Sevilla. Completamente equipado con cocina, WiFi y aire acondicionado. Ideal para parejas o familias pequeñas.',
    'C/ Sierpes 12, 3º B', 'Sevilla', 'Sevilla', 'piso', 2, 4, 1,
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    '2025-01-12'),
(2, 'Casa con jardín en Bilbao',
    'Amplia casa familiar con jardín privado y barbacoa, a 10 minutos a pie del Museo Guggenheim. Perfecta para grupos o familias con niños.',
    'Avda. Abandoibarra 8', 'Bilbao', 'Vizcaya', 'casa', 3, 6, 1,
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
    '2025-02-18'),
(3, 'Apartamento moderno en Madrid',
    'Moderno apartamento a 2 minutos del Parque del Retiro. Diseño minimalista, totalmente equipado. Acceso perfecto al metro y transporte público.',
    'C/ Alcalá 45, 2º A', 'Madrid', 'Madrid', 'apartamento', 1, 2, 1,
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    '2025-03-22'),
(4, 'Chalet con piscina en Barcelona',
    'Espectacular chalet con piscina privada a 10 minutos de la playa de Barceloneta. Ideal para familias o grupos de amigos. Terraza con vistas al mar.',
    'Paseo Marítimo 77', 'Barcelona', 'Barcelona', 'chalet', 4, 8, 1,
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    '2025-04-08');

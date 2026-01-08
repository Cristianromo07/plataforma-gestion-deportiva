-- 1. Asegurar la estructura de la tabla
CREATE TABLE IF NOT EXISTS escenarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) UNIQUE NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    capacidad_maxima INT DEFAULT 0,
    hora_apertura TIME DEFAULT '06:00:00',
    hora_cierre TIME DEFAULT '22:00:00'
);

-- 2. Limpiar datos antiguos para evitar basura en el sistema
-- (Recuerda que esto borrará las reservas asociadas a los nombres viejos)
TRUNCATE TABLE escenarios;

-- 3. Insertar ÚNICAMENTE la lista real de las imágenes
INSERT INTO escenarios (nombre, tipo) VALUES
('SAN FERNANDO', 'cancha'),
('VIVIENDAS DEL SUR', 'cancha'),
('PORVENIR', 'cancha'),
('PATINODROMO', 'pista'),
('PROVIDENCIA', 'cancha'),
('E..V.E', 'cancha'),
('AJIZÁL', 'cancha'),
('MARIA BERNAL', 'cancha'),
('LA ALDEA', 'placa'),
('TABLAZO', 'placa'),
('PARQUE DEL ARTISTA', 'cancha'),
('SAN JOSE', 'cancha'),
('ASTURIAS', 'placa'),
('INTERMUNICIPAL', 'cancha'),
('INDEPENDENCIA', 'placa'),
('SAMARIA', 'cancha'),
('YARUMITO', 'cancha'),
('SKATEPARK', 'skatepark'),
('CUBO', 'coliseo'),
('SANTANA', 'cancha'),
('LAS MARGARITAS', 'placa'),
('SAN PIO', 'placa'),
('CHORRITOS', 'placa'),
('19 DE abril', 'placa'),
('POLIDEPORTIVO', 'complejo'),
('ESTADIO', 'estadio'),
('CERRO LAS LUCES', 'pista'),
('OFICINA', 'administrativo'),
('BARILOCHE', 'placa'),
('POMAL', 'placa'),
('HORTENSIA', 'cancha'),
('LOMA LINDA', 'placa'),
('EL GUAYABO', 'cancha');

-- Aplicar cambios
COMMIT;
CREATE DATABASE IF NOT EXISTS panel_estadisticas
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE panel_estadisticas;

CREATE TABLE IF NOT EXISTS registros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  metrica ENUM('sueno', 'agua', 'ejercicio', 'animo', 'calorias') NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_metrica (metrica),
  INDEX idx_fecha (fecha)
) ENGINE=InnoDB;
-- Script para crear la base de datos y la tabla de estudiantes
CREATE DATABASE IF NOT EXISTS Estudiantes_inscritos;

USE Estudiantes_inscritos;

CREATE TABLE IF NOT EXISTS estudiantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20) NOT NULL,
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nota: Para conectar desde PHP u otro backend
-- Host: localhost
-- Usuario: root
-- Contraseña: 123456
-- Base de datos: Estudiantes_inscritos

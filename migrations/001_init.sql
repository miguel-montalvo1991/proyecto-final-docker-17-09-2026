-- 001_init.sql
-- Script de migración inicial: crea la tabla "usuarios" y algunos registros de ejemplo.
-- PostgreSQL ejecuta automáticamente los archivos .sql que encuentre en
-- /docker-entrypoint-initdb.d SOLO la primera vez que se crea el volumen de datos
-- (es decir, cuando el directorio de datos está vacío).

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Registros de ejemplo para verificar rápidamente que la migración funcionó
INSERT INTO usuarios (nombre, email) VALUES
    ('Ana Torres', 'ana.torres@example.com'),
    ('Luis Gómez', 'luis.gomez@example.com'),
    ('Richard Betancur', 'richard.betancur@example.com')
ON CONFLICT (email) DO NOTHING;

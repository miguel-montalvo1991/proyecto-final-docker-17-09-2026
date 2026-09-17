// server.js
// API REST de usuarios: CRUD completo + validación de datos + healthcheck
// Se conecta a PostgreSQL usando variables de entorno (definidas en .env / docker-compose.yml)

const express = require('express');
const { Pool } = require('pg');

// -----------------------------------------------------------------------
// Configuración de la app y del pool de conexiones a PostgreSQL
// -----------------------------------------------------------------------
const app = express();
app.use(express.json()); // permite leer JSON en el body de las peticiones

const PORT = process.env.PORT || 3000;

// El pool de pg lee la configuración de conexión desde variables de entorno.
// El host es el NOMBRE DEL SERVICIO en docker-compose.yml (ej: "db"),
// no "localhost", porque los contenedores se resuelven por nombre en la red interna de Docker.
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// -----------------------------------------------------------------------
// Función auxiliar de validación de datos de entrada
// -----------------------------------------------------------------------
// Regex simple para validar formato de email (suficiente para este ejercicio)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarUsuario({ nombre, email }) {
  const errores = [];

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
    errores.push('El campo "nombre" es obligatorio.');
  }

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errores.push('El campo "email" es obligatorio.');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errores.push('El campo "email" no tiene un formato válido.');
  }

  return errores;
}

// -----------------------------------------------------------------------
// Endpoint de salud (health check) - usado por Docker Compose / monitoreo
// -----------------------------------------------------------------------
app.get('/health', async (req, res) => {
  try {
    // Hacemos una consulta trivial para confirmar que la conexión a la BD funciona
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', db: 'connected' });
  } catch (error) {
    console.error('Health check falló:', error.message);
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

// -----------------------------------------------------------------------
// GET /usuarios - listar todos los usuarios
// -----------------------------------------------------------------------
app.get('/usuarios', async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT id, nombre, email, creado_en FROM usuarios ORDER BY id ASC'
    );
    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Error al listar usuarios:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// -----------------------------------------------------------------------
// GET /usuarios/:id - obtener un usuario por id
// -----------------------------------------------------------------------
app.get('/usuarios/:id', async (req, res) => {
  const { id } = req.params;

  // Validamos que el id sea numérico antes de consultar
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'El id debe ser numérico.' });
  }

  try {
    const resultado = await pool.query(
      'SELECT id, nombre, email, creado_en FROM usuarios WHERE id = $1',
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: `Usuario con id ${id} no encontrado.` });
    }

    res.status(200).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// -----------------------------------------------------------------------
// POST /usuarios - crear un nuevo usuario
// -----------------------------------------------------------------------
app.post('/usuarios', async (req, res) => {
  const { nombre, email } = req.body || {};

  const errores = validarUsuario({ nombre, email });
  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }

  try {
    const resultado = await pool.query(
      'INSERT INTO usuarios (nombre, email) VALUES ($1, $2) RETURNING id, nombre, email, creado_en',
      [nombre.trim(), email.trim()]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    // Código 23505 = violación de restricción UNIQUE (email duplicado)
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un usuario con ese email.' });
    }
    console.error('Error al crear usuario:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// -----------------------------------------------------------------------
// PUT /usuarios/:id - actualizar un usuario existente
// -----------------------------------------------------------------------
app.put('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, email } = req.body || {};

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'El id debe ser numérico.' });
  }

  const errores = validarUsuario({ nombre, email });
  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }

  try {
    const resultado = await pool.query(
      'UPDATE usuarios SET nombre = $1, email = $2 WHERE id = $3 RETURNING id, nombre, email, creado_en',
      [nombre.trim(), email.trim(), id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: `Usuario con id ${id} no encontrado.` });
    }

    res.status(200).json(resultado.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un usuario con ese email.' });
    }
    console.error('Error al actualizar usuario:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// -----------------------------------------------------------------------
// DELETE /usuarios/:id - eliminar un usuario
// -----------------------------------------------------------------------
app.delete('/usuarios/:id', async (req, res) => {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'El id debe ser numérico.' });
  }

  try {
    const resultado = await pool.query(
      'DELETE FROM usuarios WHERE id = $1 RETURNING id',
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: `Usuario con id ${id} no encontrado.` });
    }

    res.status(204).send(); // 204 No Content: eliminado correctamente, sin cuerpo de respuesta
  } catch (error) {
    console.error('Error al eliminar usuario:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// -----------------------------------------------------------------------
// Arranque del servidor
// -----------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`API de usuarios escuchando en el puerto ${PORT}`);
});

const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let productos = [
  { id: 1, nombre: "Teclado", precio: 80000 },
  { id: 2, nombre: "Mouse", precio: 35000 }
];

// GET /productos -> lista todo
app.get('/productos', (req, res) => {
  res.json(productos);
});

// GET /productos/:id -> busca uno, 404 si no existe
app.get('/productos/:id', (req, res) => {
  const producto = productos.find(p => p.id === Number(req.params.id));
  if (!producto) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  res.json(producto);
});

// POST /productos -> crea uno nuevo
app.post('/productos', (req, res) => {
  const { nombre, precio } = req.body;
  const nuevoId = productos.length > 0
    ? Math.max(...productos.map(p => p.id)) + 1
    : 1;
  const nuevoProducto = { id: nuevoId, nombre, precio };
  productos.push(nuevoProducto);
  res.status(201).json(nuevoProducto);
});

// PUT /productos/:id -> actualiza, 404 si no existe
app.put('/productos/:id', (req, res) => {
  const producto = productos.find(p => p.id === Number(req.params.id));
  if (!producto) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  const { nombre, precio } = req.body;
  if (nombre !== undefined) producto.nombre = nombre;
  if (precio !== undefined) producto.precio = precio;
  res.json(producto);
});

// DELETE /productos/:id -> elimina, 404 si no existe
app.delete('/productos/:id', (req, res) => {
  const index = productos.findIndex(p => p.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  productos.splice(index, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
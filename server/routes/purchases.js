const express = require('express');
const router = express.Router();

// Ruta para obtener todas las compras
router.get('/', (req, res) => {
  res.json({ message: 'Listado de compras' });
});

// Ruta para crear una nueva compra
router.post('/', (req, res) => {
  res.json({ message: 'Compra creada correctamente' });
});

// Ruta para obtener compras por cliente
router.get('/customer/:customerId', (req, res) => {
  const { customerId } = req.params;
  res.json({ message: `Compras del cliente ${customerId}` });
});

module.exports = router;
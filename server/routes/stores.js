const express = require('express');
const router = express.Router();

// Obtener todas las tiendas
router.get('/', (req, res) => {
  res.json(global.stores);
});

// Crear tienda
router.post('/', (req, res) => {
  try {
    const { name, adminId } = req.body;
    
    const newStore = {
      id: Date.now(),
      name,
      adminId,
      createdAt: new Date().toISOString()
    };
    
    global.stores.push(newStore);
    
    // Actualizar usuario con storeId
    const userIndex = global.users.findIndex(u => u.id === adminId);
    if (userIndex !== -1) {
      global.users[userIndex] = {
        ...global.users[userIndex],
        storeId: newStore.id
      };
    }
    
    res.status(201).json(newStore);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Obtener tienda por ID
router.get('/:id', (req, res) => {
  const store = global.stores.find(s => s.id === parseInt(req.params.id));
  
  if (!store) {
    return res.status(404).json({ message: 'Tienda no encontrada' });
  }
  
  res.json(store);
});

module.exports = router;
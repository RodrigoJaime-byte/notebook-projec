const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios
router.get('/', (req, res) => {
  // Enviar usuarios sin contraseñas
  const safeUsers = global.users.map(({ password, ...rest }) => rest);
  res.json(safeUsers);
});

// Crear usuario
router.post('/', async (req, res) => {
  try {
    const { username, password, name, role, storeId } = req.body;
    
    // Verificar si el usuario ya existe
    if (global.users.some(u => u.username === username)) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }
    
    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = {
      id: Date.now(),
      username,
      password: hashedPassword,
      name,
      role,
      storeId: storeId || null
    };
    
    global.users.push(newUser);
    
    // Enviar usuario sin contraseña
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;
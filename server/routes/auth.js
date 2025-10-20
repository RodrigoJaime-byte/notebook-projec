const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Ruta de login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Buscar usuario
    const user = global.users.find(u => u.username === username);
    
    if (!user) {
      return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
    }
    
    // Verificar contraseña (usando bcrypt)
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
    }
    
    // Crear token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secrettemp',
      { expiresIn: '1d' }
    );
    
    // Enviar respuesta
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        storeId: user.storeId
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Ruta para obtener usuario actual
router.get('/me', (req, res) => {
  try {
    // Aquí iría middleware de autenticación
    const token = req.header('x-auth-token');
    
    if (!token) {
      return res.status(401).json({ message: 'No hay token, autorización denegada' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secrettemp');
    const user = global.users.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      storeId: user.storeId
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Token no válido' });
  }
});

module.exports = router;
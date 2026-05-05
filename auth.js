// src/middleware/auth.js
// Middleware de vérification du token JWT pour les routes admin

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'tl_elect_jwt_secret_change_in_production';

function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non autorisé — token manquant' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

module.exports = { requireAuth, JWT_SECRET };

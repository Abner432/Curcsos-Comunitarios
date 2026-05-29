// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'abemce_super_secret_key_123';

/**
 * Middleware para validar o token JWT enviado no cabeçalho Authorization
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <TOKEN>

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido ou expirado.' });
  }
}

/**
 * Middleware para exigir papel específico (ex: 'admin')
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso proibido. Sem privilégios suficientes.' });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles,
  JWT_SECRET
};

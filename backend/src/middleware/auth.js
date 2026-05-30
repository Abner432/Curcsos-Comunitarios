const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'abemce_super_secret_key_123';

function authenticateToken(requisition, response, next) {
  const authHeader = requisition.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return response.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    requisition.user = verified;
    next();
  } catch (error) {
    return response.status(403).json({ error: 'Token inválido ou expirado.' });
  }
}

function authorizeRoles(...allowedRoles) {
  return (requisition, response, next) => {
    if (!requisition.user || !allowedRoles.includes(requisition.user.role)) {
      return response.status(403).json({ error: 'Acesso proibido. Sem privilégios suficientes.' });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles,
  JWT_SECRET
};

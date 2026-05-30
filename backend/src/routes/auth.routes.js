const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

router.post('/register', async (req, res) => {
  const { name, email, cpf, password, neighborhood } = req.body;

  if (!name || !email || !cpf || !password || !neighborhood) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios!' });
  }

  try {
    const existingUsers = await db.query(
      'SELECT id FROM users WHERE email = ? OR cpf = ?',
      [email, cpf]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'E-mail ou CPF já cadastrados!' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await db.query(
      'INSERT INTO users (name, email, cpf, password_hash, role, neighborhood) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, cpf, passwordHash, 'student', neighborhood]
    );

    return res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    return res.status(500).json({ error: 'Erro interno no servidor ao cadastrar.' });
  }
});

router.post('/login', async (req, res) => {
  const { emailOrCpf, password } = req.body;

  if (!emailOrCpf || !password) {
    return res.status(400).json({ error: 'Identificação (E-mail/CPF) e senha são obrigatórios!' });
  }

  try {
    const users = await db.query(
      'SELECT * FROM users WHERE email = ? OR cpf = ?',
      [emailOrCpf, emailOrCpf]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas! Usuário não encontrado.' });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas! Senha incorreta.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        neighborhood: user.neighborhood
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno no servidor ao efetuar login.' });
  }
});

module.exports = router;
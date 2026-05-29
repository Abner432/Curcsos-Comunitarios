// backend/src/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');
const studentRoutes = require('./routes/student.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas da API RESTful
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/admin', studentRoutes);

// Servir arquivos estáticos do Frontend Web
// Isso unifica o projeto e torna a execução extremamente fácil: rodando apenas o backend, todo o site fica ativo!
const frontendPath = path.join(__dirname, '../../frontend/web');
app.use(express.static(frontendPath));

// Fallback para SPA/Multipage (redirecionar rotas indefinidas para o index ou carregar páginas estáticas diretamente)
app.get('*', (req, res) => {
  // Se for uma requisição de API inexistente, envia 404
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint da API não encontrado.' });
  }
  // Caso contrário, serve o index.html principal
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Inicialização do Servidor
app.listen(PORT, () => {
  console.log(`========================================================================`);
  console.log(`🚀 Portal ABEMCE rodando com sucesso!`);
  console.log(`👉 Acesse a aplicação no navegador em: http://localhost:${PORT}`);
  console.log(`========================================================================`);
});

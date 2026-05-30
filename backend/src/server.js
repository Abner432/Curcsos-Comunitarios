const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');
const studentRoutes = require('./routes/student.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/admin', studentRoutes);

const frontendPath = path.join(__dirname, '../../frontend/web');
app.use(express.static(frontendPath));
app.use('/javascript', express.static(path.join(__dirname, '../../frontend/javascript')));

app.get('*', (requisition, response) => {
  if (requisition.originalUrl.startsWith('/api')) {
    return response.status(404).json({ error: 'Endpoint da API não encontrado.' });
  }
  response.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`========================================================================`);
  console.log(`🚀 Portal ABEMCE rodando com sucesso!`);
  console.log(`👉 Acesse a aplicação no navegador em: http://localhost:${PORT}`);
  console.log(`========================================================================`);
});

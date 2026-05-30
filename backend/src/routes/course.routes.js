const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  const { category } = req.query;

  try {
    let courses = await db.query('SELECT * FROM courses ORDER BY title ASC');

    if (category && category !== 'Todos') {
      courses = courses.filter(c => c.category.toLowerCase() === category.toLowerCase());
    }

    return res.json(courses);
  } catch (error) {
    console.error('Erro ao buscar cursos:', error);
    return res.status(500).json({ error: 'Erro ao buscar cursos disponíveis.' });
  }
});

router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { title, category, description, image_url, lessons_count } = req.body;

  if (!title || !category || !description) {
    return res.status(400).json({ error: 'Título, categoria e descrição são obrigatórios!' });
  }

  const count = Number(lessons_count) || 10;

  try {
    const result = await db.query(
      'INSERT INTO courses (title, category, description, image_url, lessons_count) VALUES (?, ?, ?, ?, ?)',
      [title, category, description, image_url, count]
    );

    return res.status(201).json({
      message: 'Curso cadastrado com sucesso!',
      courseId: result.insertId
    });
  } catch (error) {
    console.error('Erro ao cadastrar curso:', error);
    return res.status(500).json({ error: 'Erro interno ao cadastrar curso.' });
  }
});

router.post('/:id/enroll', authenticateToken, authorizeRoles('student'), async (req, res) => {
  const courseId = req.params.id;
  const userId = req.user.id;

  try {
    const courses = await db.query('SELECT id FROM courses WHERE id = ?', [courseId]);
    if (courses.length === 0) {
      return res.status(404).json({ error: 'Curso não encontrado!' });
    }

    const result = await db.query(
      'INSERT INTO enrollments (user_id, course_id, progress, status) VALUES (?, ?, 0, "active")',
      [userId, courseId]
    );

    return res.status(201).json({
      message: 'Inscrição realizada com sucesso!',
      enrollmentId: result.insertId
    });
  } catch (error) {
    if (error.message && error.message.includes('já inscrito')) {
      return res.status(400).json({ error: 'Você já está matriculado neste curso!' });
    }
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Você já está matriculado neste curso!' });
    }
    console.error('Erro ao se inscrever:', error);
    return res.status(500).json({ error: 'Erro ao realizar inscrição no curso.' });
  }
});

router.get('/my-enrollments', authenticateToken, authorizeRoles('student'), async (req, res) => {
  const userId = req.user.id;

  try {
    const enrollments = await db.query(
      `SELECT e.id, e.course_id, c.title, c.category, c.image_url, e.progress, c.lessons_count 
       FROM enrollments e 
       JOIN courses c ON e.course_id = c.id 
       WHERE e.user_id = ?`,
      [userId]
    );

    return res.json(enrollments);
  } catch (error) {
    console.error('Erro ao buscar matrículas:', error);
    return res.status(500).json({ error: 'Erro ao carregar seus cursos.' });
  }
});

router.put('/my-enrollments/:id/progress', authenticateToken, authorizeRoles('student'), async (req, res) => {
  const enrollmentId = req.params.id;
  const userId = req.user.id;
  const { progress } = req.body;

  if (progress === undefined || progress < 0 || progress > 100) {
    return res.status(400).json({ error: 'O progresso deve ser um valor entre 0 e 100!' });
  }

  try {
    const result = await db.query(
      'UPDATE enrollments SET progress = ? WHERE id = ? AND user_id = ?',
      [progress, enrollmentId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Matrícula não encontrada ou acesso negado!' });
    }

    return res.json({ message: 'Progresso atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar progresso:', error);
    return res.status(500).json({ error: 'Erro ao atualizar progresso da matrícula.' });
  }
});

module.exports = router;

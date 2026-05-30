const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/metrics', authenticateToken, authorizeRoles('admin'), async (requisition, response) => {
  try {
    const metricsResult = await db.query(
      `SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'student') as totalStudents,
        (SELECT COUNT(*) FROM courses) as activeCourses`
    );

    let totalStudents = 856;
    let activeCourses = 24;
    let jovensAprendizes = 142;
    let formacaoMusical = 68;


    if (metricsResult && metricsResult.length > 0) {
      const dbStudents = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
      const dbCourses = await db.query("SELECT COUNT(*) as count FROM courses");
      
      const dbJovens = await db.query(
        "SELECT COUNT(*) as count FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE c.category LIKE '%aprendiz%'"
      );
      const dbMusica = await db.query(
        "SELECT COUNT(*) as count FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE c.category LIKE '%música%'"
      );

      totalStudents = 850 + (dbStudents[0]?.count || 0);
      activeCourses = (dbCourses[0]?.count || 3);
      jovensAprendizes = 140 + (dbJovens[0]?.count || 0);
      formacaoMusical = 66 + (dbMusica[0]?.count || 0);
    }

    if (db.getUseMock()) {
      const mockMetrics = db.mockDb.users.filter(u => u.role === 'student').length;
      totalStudents = 850 + mockMetrics;
      activeCourses = db.mockDb.courses.length;
      jovensAprendizes = 140 + db.mockDb.enrollments.filter(e => e.course_id === 2).length;
      formacaoMusical = 66 + db.mockDb.enrollments.filter(e => e.course_id === 3).length;
    }

    return response.json({
      totalStudents,
      activeCourses,
      jovensAprendizes,
      formacaoMusical
    });
  } catch (error) {
    console.error('Erro ao buscar métricas admin:', error);
    return response.status(500).json({ error: 'Erro ao gerar métricas do dashboard.' });
  }
});

router.get('/enrollments', authenticateToken, authorizeRoles('admin'), async (requisition, response) => {
  try {
    const enrollments = await db.query(
      `SELECT u.name as studentName, c.title as courseTitle, u.neighborhood, e.created_at as enrollmentDate 
       FROM enrollments e 
       JOIN users u ON e.user_id = u.id 
       JOIN courses c ON e.course_id = c.id 
       ORDER BY e.created_at DESC`
    );

    return response.json(enrollments);
  } catch (error) {
    console.error('Erro ao buscar inscrições recentes:', error);
    return response.status(500).json({ error: 'Erro ao carregar lista de matrículas.' });
  }
});

router.get('/students', authenticateToken, authorizeRoles('admin'), async (requisition, response) => {
  try {
    const students = await db.query(
      "SELECT id, name, email, cpf, neighborhood, created_at FROM users WHERE role = 'student'"
    );

    const detailedStudents = [];
    for (const student of students) {
      const enrollments = await db.query(
        `SELECT e.id, c.title, e.progress, c.lessons_count 
         FROM enrollments e 
         JOIN courses c ON e.course_id = c.id 
         WHERE e.user_id = ?`,
        [student.id]
      );
      detailedStudents.push({
        ...student,
        enrollments
      });
    }

    return response.json(detailedStudents);
  } catch (error) {
    console.error('Erro ao buscar diretório de alunos:', error);
    return response.status(500).json({ error: 'Erro ao carregar diretório de alunos.' });
  }
});

router.get('/export-report', authenticateToken, authorizeRoles('admin'), async (requisition, response) => {
  try {
    const data = await db.query(
      `SELECT u.name, u.email, u.cpf, u.neighborhood, c.title as course, e.progress, e.created_at
       FROM enrollments e
       JOIN users u ON e.user_id = u.id
       JOIN courses c ON e.course_id = c.id`
    );
    
    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Content-Disposition', 'attachment; filename=relatorio_abemce.json');
    return response.json(data);
  } catch (error) {
    return response.status(500).json({ error: 'Erro ao exportar relatório.' });
  }
});

module.exports = router;
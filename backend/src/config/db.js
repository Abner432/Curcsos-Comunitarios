const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

let pool = null;
let useMock = false;

const mockDb = {
  users: [
    {
      id: 1,
      name: 'Coordenação ABEMCE',
      email: 'admin@abemce.org.br',
      cpf: '000.000.000-00',
      password_hash: bcrypt.hashSync('admin123', 10),
      role: 'admin',
      neighborhood: 'Centro',
      created_at: new Date()
    },
    {
      id: 2,
      name: 'Jefferson Lima',
      email: 'aluno@abemce.org.br',
      cpf: '111.111.111-11',
      password_hash: bcrypt.hashSync('aluno123', 10),
      role: 'student',
      neighborhood: 'Parque São José',
      created_at: new Date()
    },
    {
      id: 3,
      name: 'Marta Silva',
      email: 'marta@gmail.com',
      cpf: '222.222.222-22',
      password_hash: bcrypt.hashSync('aluno123', 10),
      role: 'student',
      neighborhood: 'Mondubim',
      created_at: new Date()
    },
    {
      id: 4,
      name: 'Kauan Oliveira',
      email: 'kauan@gmail.com',
      cpf: '333.333.333-33',
      password_hash: bcrypt.hashSync('aluno123', 10),
      role: 'student',
      neighborhood: 'Maraponga',
      created_at: new Date()
    }
  ],
  courses: [
    {
      id: 1,
      title: 'Criando oportunidades',
      category: 'Qualificação profissional',
      description: 'Qualificação profissional voltada à inserção produtiva em parceria com a SPS Ceará.',
      image_url: '/src/img/costura.jpg',
      lessons_count: 15,
      created_at: new Date()
    },
    {
      id: 2,
      title: 'Jovem aprendiz',
      category: 'Qualificação profissional',
      description: 'Oportunidade de capacitação e crescimento profissional para jovens talentos de Fortaleza.',
      image_url: '/src/img/jovem_aprendiz.jpg',
      lessons_count: 10,
      created_at: new Date()
    },
    {
      id: 3,
      title: 'Formação musical',
      category: 'Música (Banda marcial)',
      description: 'Aulas de sopro, percussão e teoria musical. Faça parte das nossas bandas oficiais.',
      image_url: '/src/img/musica.jpg',
      lessons_count: 20,
      created_at: new Date()
    }
  ],
  enrollments: [
    {
      id: 1,
      user_id: 2,
      course_id: 2,
      progress: 40,
      status: 'active',
      created_at: new Date('2026-05-02T13:00:00Z')
    },
    {
      id: 2,
      user_id: 3,
      course_id: 1,
      progress: 60,
      status: 'active',
      created_at: new Date('2026-05-01T14:30:00Z')
    },
    {
      id: 3,
      user_id: 4,
      course_id: 3,
      progress: 15,
      status: 'active',
      created_at: new Date('2026-04-28T09:15:00Z')
    }
  ]
};

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'abemce_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function initDb() {
  try {
    pool = mysql.createPool(dbConfig);
    await pool.query('SELECT 1');

    console.log('✅ Conexão com o banco de dados MySQL estabelecida com sucesso!');
    useMock = false;
  } catch (error) {
    console.warn('⚠️ Não foi possível conectar ao MySQL local.');
    console.warn('ℹ️ Detalhe do erro:', error.message);
    console.warn('⚡ Ativando o Modo SIMULADO (Banco de dados em memória) para demonstração instantânea!');

    useMock = true;
    pool = null;
  }
}

initDb();

async function query(sql, params = []) {
  if (!useMock && pool) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (error) {
      console.error('Erro na query MySQL, recorrendo ao banco simulado:', error.message);
      return executeMockQuery(sql, params);
    }
  } else {
    return executeMockQuery(sql, params);
  }
}

function executeMockQuery(sql, params) {
  const cleanSql = sql.replace(/\s+/g, ' ').trim().toLowerCase();

  if (cleanSql.includes('from users') && cleanSql.includes('email =') && cleanSql.includes('cpf =')) {
    const searchVal = params[0]; // O parâmetro passado duas vezes para email e cpf
    const user = mockDb.users.find(u => u.email === searchVal || u.cpf === searchVal);
    return user ? [user] : [];
  }

  if (cleanSql.includes('select') && cleanSql.includes('from users where id =')) {
    const id = params[0];
    const user = mockDb.users.find(u => u.id === Number(id));
    return user ? [user] : [];
  }

  if (cleanSql.includes('from users') && cleanSql.includes('email = ? or cpf = ?')) {
    const email = params[0];
    const cpf = params[1];
    const user = mockDb.users.find(u => u.email === email || u.cpf === cpf);
    return user ? [user] : [];
  }

  if (cleanSql.includes('insert into users')) {
    const [name, email, cpf, password_hash, role, neighborhood] = params;
    
    const duplicate = mockDb.users.some(u => u.email === email || u.cpf === cpf);
    if (duplicate) {
      const error = new Error('Duplicate entry for email/CPF');
      error.code = 'ER_DUP_ENTRY';
      throw error;
    }

    const newId = mockDb.users.length + 1;
    const newUser = {
      id: newId,
      name,
      email,
      cpf,
      password_hash,
      role: role || 'student',
      neighborhood,
      created_at: new Date()
    };
    mockDb.users.push(newUser);
    return { insertId: newId, affectedRows: 1 };
  }

  if (cleanSql.includes('from courses') && !cleanSql.includes('where')) {
    return mockDb.courses;
  }

  if (cleanSql.includes('from courses where id =')) {
    const id = params[0];
    const course = mockDb.courses.find(c => c.id === Number(id));
    return course ? [course] : [];
  }

  if (cleanSql.includes('insert into courses')) {
    const [title, category, description, image_url, lessons_count] = params;
    const newId = mockDb.courses.length + 1;

    const newCourse = {
      id: newId,
      title,
      category,
      description,
      image_url: image_url || '/src/img/default.jpg',
      lessons_count: Number(lessons_count) || 10,
      created_at: new Date()
    };

    mockDb.courses.push(newCourse);
    return { insertId: newId, affectedRows: 1 };
  }

  if (cleanSql.includes('insert into enrollments')) {
    const [user_id, course_id] = params;
    const existing = mockDb.enrollments.find(e => e.user_id === Number(user_id) && e.course_id === Number(course_id));

    if (existing) {
      const error = new Error('Usuário já inscrito neste curso!');
      throw error;
    }

    const newId = mockDb.enrollments.length + 1;
    const newEnrollment = {
      id: newId,
      user_id: Number(user_id),
      course_id: Number(course_id),
      progress: 0,
      status: 'active',
      created_at: new Date()
    };

    mockDb.enrollments.push(newEnrollment);
    return { insertId: newId, affectedRows: 1 };
  }

  if (cleanSql.includes('from enrollments') && cleanSql.includes('join courses') && cleanSql.includes('where e.user_id =')) {
    const userId = params[0];
    const studentEnrollments = mockDb.enrollments.filter(e => e.user_id === Number(userId));
    
    return studentEnrollments.map(event => {
      const course = mockDb.courses.find(c => c.id === event.course_id);

      return {
        id: event.id,
        course_id: event.course_id,
        title: course ? course.title : 'Curso Indefinido',
        category: course ? course.category : 'Geral',
        image_url: course ? course.image_url : '/src/img/default.jpg',
        progress: event.progress,
        lessons_count: course ? course.lessons_count : 10
      };
    });
  }

  if (cleanSql.includes('update enrollments set progress =') || (cleanSql.includes('update enrollments') && cleanSql.includes('progress = ?'))) {
    const [progress, enrollment_id, user_id] = params;
    const enrollment = mockDb.enrollments.find(e => e.id === Number(enrollment_id) && e.user_id === Number(user_id));

    if (enrollment) {
      enrollment.progress = Number(progress);
      if (enrollment.progress >= 100) {
        enrollment.status = 'completed';
      }
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  if (cleanSql.includes('count') && cleanSql.includes('from enrollments') && !cleanSql.includes('where')) {
    return [{
      totalStudents: mockDb.users.filter(u => u.role === 'student').length,
      activeCourses: mockDb.courses.length,
      jovensAprendizes: mockDb.enrollments.filter(e => {
        const c = mockDb.courses.find(course => course.id === e.course_id);
        return c && c.category.toLowerCase().includes('aprendiz');
      }).length,
      formacaoMusical: mockDb.enrollments.filter(e => {
        const c = mockDb.courses.find(course => course.id === e.course_id);
        return c && c.category.toLowerCase().includes('música');
      }).length
    }];
  }

  if (cleanSql.includes('from enrollments') && cleanSql.includes('join users') && cleanSql.includes('join courses')) {
    return mockDb.enrollments.map (event => {
      const student = mockDb.users.find(u => u.id === event.user_id);
      const course = mockDb.courses.find(c => c.id === event.course_id);
      return {
        studentName: student ? student.name : 'Aluno Removido',
        courseTitle: course ? course.title : 'Curso Removido',
        neighborhood: student ? student.neighborhood : 'Desconhecido',
        enrollmentDate: event.created_at
      };
    }).sort((a, b) => new Date(b.enrollmentDate) - new Date(a.enrollmentDate));
  }

  if (cleanSql.includes('from users') && cleanSql.includes("role = 'student'")) {
    return mockDb.users.filter(u => u.role === 'student').map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      cpf: u.cpf,
      neighborhood: u.neighborhood,
      created_at: u.created_at
    })).sort((a, b) => a.name.localeCompare(b.name));
  }

  return [];
}

module.exports = {
  query,
  getUseMock: () => useMock,
  mockDb
};
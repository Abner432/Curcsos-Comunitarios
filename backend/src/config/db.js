// backend/src/config/db.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

let pool = null;
let useMock = false;

// Banco de dados em memória inicial (Mock Database)
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

// Configurações do MySQL vindas de variáveis de ambiente ou valores padrão
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

// Inicialização da conexão
async function initDb() {
  try {
    // Tenta conectar ao MySQL
    pool = mysql.createPool(dbConfig);
    // Testa a conexão rodando uma query simples
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

// Inicializa a conexão logo ao carregar o módulo
initDb();

/**
 * Função de Query Genérica. Se o MySQL estiver ativo, executa nele.
 * Caso contrário, simula o comportamento dos dados usando o MockDb.
 */
async function query(sql, params = []) {
  if (!useMock && pool) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (err) {
      console.error('Erro na query MySQL, recorrendo ao banco simulado:', err.message);
      // Caso dê algum erro em tempo de execução no MySQL, o mock salva o fluxo
      return executeMockQuery(sql, params);
    }
  } else {
    return executeMockQuery(sql, params);
  }
}

/**
 * Interpretador simplificado de queries mock
 * Mapeia as consultas SQL do backend em filtros de arrays Javascript
 */
function executeMockQuery(sql, params) {
  const cleanSql = sql.replace(/\s+/g, ' ').trim().toLowerCase();

  // 1. SELECT USERS POR EMAIL OU CPF (Login)
  if (cleanSql.includes('from users') && cleanSql.includes('email =') && cleanSql.includes('cpf =')) {
    const searchVal = params[0]; // O parâmetro passado duas vezes para email e cpf
    const user = mockDb.users.find(u => u.email === searchVal || u.cpf === searchVal);
    return user ? [user] : [];
  }

  // 2. SELECT USER POR ID
  if (cleanSql.includes('select') && cleanSql.includes('from users where id =')) {
    const id = params[0];
    const user = mockDb.users.find(u => u.id === Number(id));
    return user ? [user] : [];
  }

  // 3. SELECT USER POR EMAIL OU CPF DUPLICADO (Cadastro)
  if (cleanSql.includes('from users') && cleanSql.includes('email = ? or cpf = ?')) {
    const email = params[0];
    const cpf = params[1];
    const user = mockDb.users.find(u => u.email === email || u.cpf === cpf);
    return user ? [user] : [];
  }

  // 4. INSERT INTO USERS (Cadastro de Aluno)
  if (cleanSql.includes('insert into users')) {
    // name, email, cpf, password_hash, role, neighborhood
    const [name, email, cpf, password_hash, role, neighborhood] = params;
    
    // Validar restrição de unicidade (Simulação de UNIQUE KEY do MySQL)
    const duplicate = mockDb.users.some(u => u.email === email || u.cpf === cpf);
    if (duplicate) {
      const err = new Error('Duplicate entry for email/CPF');
      err.code = 'ER_DUP_ENTRY';
      throw err;
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

  // 5. SELECT ALL COURSES
  if (cleanSql.includes('from courses') && !cleanSql.includes('where')) {
    return mockDb.courses;
  }

  // 6. SELECT COURSE POR ID
  if (cleanSql.includes('from courses where id =')) {
    const id = params[0];
    const course = mockDb.courses.find(c => c.id === Number(id));
    return course ? [course] : [];
  }

  // 7. INSERT INTO COURSES (Cadastro de Cursos)
  if (cleanSql.includes('insert into courses')) {
    // title, category, description, image_url, lessons_count
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

  // 8. INSERT INTO ENROLLMENTS (Inscrição)
  if (cleanSql.includes('insert into enrollments')) {
    // user_id, course_id, progress, status
    const [user_id, course_id] = params;
    
    // Evita duplicados
    const existing = mockDb.enrollments.find(e => e.user_id === Number(user_id) && e.course_id === Number(course_id));
    if (existing) {
      throw new Error('Usuário já inscrito neste curso!');
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

  // 9. SELECT MINHAS INSCRIÇÕES (Meus Cursos)
  // Refinado com 'where e.user_id =' para não colidir com o select do admin join
  if (cleanSql.includes('from enrollments') && cleanSql.includes('join courses') && cleanSql.includes('where e.user_id =')) {
    const userId = params[0];
    const studentEnrollments = mockDb.enrollments.filter(e => e.user_id === Number(userId));
    
    return studentEnrollments.map(e => {
      const course = mockDb.courses.find(c => c.id === e.course_id);
      return {
        id: e.id,
        course_id: e.course_id,
        title: course ? course.title : 'Curso Indefinido',
        category: course ? course.category : 'Geral',
        image_url: course ? course.image_url : '/src/img/default.jpg',
        progress: e.progress,
        lessons_count: course ? course.lessons_count : 10
      };
    });
  }

  // 10. UPDATE ENROLLMENT PROGRESS
  if (cleanSql.includes('update enrollments set progress =') || (cleanSql.includes('update enrollments') && cleanSql.includes('progress = ?'))) {
    // progress, enrollment_id, user_id
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

  // 11. ADMIN METRICS
  if (cleanSql.includes('count') && cleanSql.includes('from enrollments') && !cleanSql.includes('where')) {
    // Para simplificar a rota admin metrics, retornamos as contagens direto do MockDb
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

  // 12. ADMIN ENROLLMENTS LIST (Tabela)
  // Especifica o join com users e courses de forma limpa
  if (cleanSql.includes('from enrollments') && cleanSql.includes('join users') && cleanSql.includes('join courses')) {
    return mockDb.enrollments.map(e => {
      const student = mockDb.users.find(u => u.id === e.user_id);
      const course = mockDb.courses.find(c => c.id === e.course_id);
      return {
        studentName: student ? student.name : 'Aluno Removido',
        courseTitle: course ? course.title : 'Curso Removido',
        neighborhood: student ? student.neighborhood : 'Desconhecido',
        enrollmentDate: e.created_at
      };
    }).sort((a, b) => new Date(b.enrollmentDate) - new Date(a.enrollmentDate));
  }

  // 13. SELECT STUDENTS DIRECTORY (Gestão de Alunos)
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

  // Fallback para arrays vazios se a query não for identificada
  return [];
}

module.exports = {
  query,
  getUseMock: () => useMock,
  mockDb // exposto para manipulação e visualização caso necessário
};

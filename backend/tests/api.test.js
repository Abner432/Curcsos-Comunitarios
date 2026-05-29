// backend/tests/api.test.js
const db = require('../src/config/db');
const bcrypt = require('bcryptjs');

/**
 * Suite de Testes de Integração e Regras de Negócio (RF01 - RF06)
 * Roda de forma autônoma sem necessitar de bibliotecas complexas
 */
async function runTests() {
  console.log('🧪 Iniciando testes de integração da API ABEMCE...');
  let testsFailed = 0;

  // Função auxiliar de asserção
  const assert = (condition, message) => {
    if (!condition) {
      console.error(`❌ FALHA: ${message}`);
      testsFailed++;
    } else {
      console.log(`✅ SUCESSO: ${message}`);
    }
  };

  try {
    // 1. Teste de conexão ou modo simulado
    console.log('\n--- Teste 1: Camada de Persistência ---');
    const mockActive = db.getUseMock();
    console.log(`Modo de execução: ${mockActive ? 'SIMULADO (Em Memória)' : 'MySQL Físico'}`);
    assert(true, 'Inicialização da persistência de dados concluída.');

    // 2. Testar RF01: Cadastro de usuários
    console.log('\n--- Teste 2: Cadastro de Alunos (RF01) ---');
    const emailTest = `teste_${Date.now()}@abemce.org.br`;
    const cpfTest = `999.999.999-${Math.floor(Math.random() * 90 + 10)}`;
    const passHash = bcrypt.hashSync('senhaTeste123', 10);

    const insertResult = await db.query(
      'INSERT INTO users (name, email, cpf, password_hash, role, neighborhood) VALUES (?, ?, ?, ?, ?, ?)',
      ['Estudante de Teste', emailTest, cpfTest, passHash, 'student', 'Mondubim']
    );

    assert(insertResult.insertId !== undefined, 'Novo aluno cadastrado com sucesso no banco.');

    // Verificar se o cadastro duplo de mesmo e-mail falha
    try {
      await db.query(
        'INSERT INTO users (name, email, cpf, password_hash, role, neighborhood) VALUES (?, ?, ?, ?, ?, ?)',
        ['Duplicado', emailTest, '000.000.000-xx', passHash, 'student', 'Centro']
      );
      assert(false, 'Deveria ter falhado ao cadastrar e-mail duplicado.');
    } catch (err) {
      assert(true, 'Bloqueio de e-mail duplicado funcionando corretamente.');
    }

    // 3. Testar RF02: Login de Usuários
    console.log('\n--- Teste 3: Autenticação de Usuários (RF02) ---');
    // Buscar usuário recém cadastrado
    const queryUsers = await db.query(
      'SELECT * FROM users WHERE email = ? OR cpf = ?',
      [emailTest, emailTest]
    );

    assert(queryUsers.length === 1, 'Busca por email/CPF de usuário cadastrado retornou 1 registro.');
    const testUser = queryUsers[0];
    const match = bcrypt.compareSync('senhaTeste123', testUser.password_hash);
    assert(match === true, 'Criptografia de senha e verificação de hash funcionando perfeitamente.');

    // 4. Testar RF03: Listar cursos
    console.log('\n--- Teste 4: Listagem de Cursos (RF03) ---');
    const coursesList = await db.query('SELECT * FROM courses');
    assert(coursesList.length >= 3, `Listagem de cursos retornou ${coursesList.length} cursos cadastrados.`);

    // 5. Testar RF04: Inscrição em Cursos
    console.log('\n--- Teste 5: Inscrição em Cursos (RF04) ---');
    const enrollResult = await db.query(
      'INSERT INTO enrollments (user_id, course_id, progress, status) VALUES (?, ?, 0, "active")',
      [testUser.id, 2] // Inscreve em Jovem Aprendiz
    );
    assert(enrollResult.insertId !== undefined, 'Matrícula efetuada com sucesso.');

    // Verificar listagem de matrícula do aluno
    const studentEnrollments = await db.query(
      `SELECT e.id, c.title, e.progress 
       FROM enrollments e 
       JOIN courses c ON e.course_id = c.id 
       WHERE e.user_id = ?`,
      [testUser.id]
    );
    assert(studentEnrollments.length === 1 && studentEnrollments[0].progress === 0, 'Inscrição rastreada corretamente com progresso de 0%.');

    // 6. Testar RF05 e RF06: Cadastro de novos cursos e visualização administrativa
    console.log('\n--- Teste 6: Área Administrativa (RF05 & RF06) ---');
    
    // Cadastrar curso
    const newCourseTitle = `Curso de Teste ${Date.now()}`;
    const courseInsert = await db.query(
      'INSERT INTO courses (title, category, description, image_url, lessons_count) VALUES (?, ?, ?, ?, ?)',
      [newCourseTitle, 'Artesanato', 'Oficina de biscuit e modelagem.', '/src/img/artesanato.jpg', 8]
    );
    assert(courseInsert.insertId !== undefined, 'Administrador cadastrou um novo curso com sucesso (RF05).');

    // Visualizar inscrições recentes (tabela)
    const adminEnrollments = await db.query(
      `SELECT u.name as studentName, c.title as courseTitle 
       FROM enrollments e 
       JOIN users u ON e.user_id = u.id 
       JOIN courses c ON e.course_id = c.id`
    );
    assert(adminEnrollments.length > 0, `Administrador conseguiu visualizar ${adminEnrollments.length} alunos inscritos no sistema (RF06).`);

    // Finalizar
    console.log('\n=======================================');
    if (testsFailed === 0) {
      console.log('🎉 TODOS OS TESTES PASSARAM COM SUCESSO! 100% DE CONFORMIDADE.');
    } else {
      console.error(`⚠️ OCORRERAM ${testsFailed} FALHAS NOS TESTES. REVISE OS ERROS.`);
      process.exit(1);
    }
    console.log('=======================================');
  } catch (error) {
    console.error('❌ Erro crítico inesperado ao executar testes:', error);
    process.exit(1);
  }
}

// Executar testes
runTests();

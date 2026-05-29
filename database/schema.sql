-- schema.sql
-- Estrutura do Banco de Dados para a Plataforma ABEMCE
-- Pode ser executado em qualquer gerenciador MySQL (ex: phpMyAdmin, MySQL Workbench)

CREATE DATABASE IF NOT EXISTS abemce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE abemce_db;

-- 1. TABELA DE USUÁRIOS
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    cpf VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'student') NOT NULL DEFAULT 'student',
    neighborhood VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABELA DE CURSOS
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255) DEFAULT NULL,
    lessons_count INT NOT NULL DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABELA DE MATRÍCULAS (ENROLLMENTS)
CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    progress INT NOT NULL DEFAULT 0,
    status ENUM('active', 'completed') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_course (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABELA DE COMPLEMENTO DE AULAS (OPCIONAL, PARA CÁLCULO DE PROGRESSO)
CREATE TABLE IF NOT EXISTS lessons_completed (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id INT NOT NULL,
    lesson_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_enrollment_lesson (enrollment_id, lesson_index),
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- SEED DATA DE EXEMPLO (Inserção das contas fake iniciais e cursos mock)
-- =========================================================================

-- Inserir Usuário Administrador (Senha criptografada no backend. Para representação, 'admin123' bcrypt hash)
-- bcrypt de 'admin123' = $2a$10$wL4eApe8i0t/yZ6rR0dGRe8TjH95n9e9U8i8Jz/U.hEee1aM2GXeS (exemplo genérico)
INSERT INTO users (name, email, cpf, password_hash, role, neighborhood) 
VALUES (
    'Coordenação ABEMCE', 
    'admin@abemce.org.br', 
    '000.000.000-00', 
    '$2a$10$T87sK3k1.qF1qVwEq1hDdeEaVj3z8xV05fO2g2h1I0i2j3k4l5m6n', -- Senha: admin123
    'admin', 
    'Centro'
) ON DUPLICATE KEY UPDATE id=id;

-- Inserir Usuário Aluno Padrão (Senha: aluno123)
INSERT INTO users (name, email, cpf, password_hash, role, neighborhood) 
VALUES (
    'Jefferson Lima', 
    'aluno@abemce.org.br', 
    '111.111.111-11', 
    '$2a$10$vK6sJ2j0.pE0pUvDp0gCcdDaUi2y7wU04eN1f1g0Hzi1h2i3j4k5l', -- Senha: aluno123
    'student', 
    'Parque São José'
) ON DUPLICATE KEY UPDATE id=id;

-- Inserir alguns alunos adicionais para popular o dashboard
INSERT INTO users (name, email, cpf, password_hash, role, neighborhood) VALUES
('Marta Silva', 'marta@gmail.com', '222.222.222-22', 'hash', 'student', 'Mondubim'),
('Kauan Oliveira', 'kauan@gmail.com', '333.333.333-33', 'hash', 'student', 'Maraponga')
ON DUPLICATE KEY UPDATE id=id;

-- Inserir Cursos Iniciais
INSERT INTO courses (id, title, category, description, image_url, lessons_count) VALUES
(1, 'Criando oportunidades', 'Qualificação profissional', 'Qualificação profissional voltada à inserção produtiva em parceria com a SPS Ceará.', '/src/img/costura.jpg', 15),
(2, 'Jovem aprendiz', 'Qualificação profissional', 'Oportunidade de capacitação e crescimento profissional para jovens talentos de Fortaleza.', '/src/img/jovem_aprendiz.jpg', 10),
(3, 'Formação musical', 'Música (Banda marcial)', 'Aulas de sopro, percussão e teoria musical. Faça parte das nossas bandas oficiais.', '/src/img/musica.jpg', 20)
ON DUPLICATE KEY UPDATE id=id;

-- Inserir Matrículas iniciais
INSERT INTO enrollments (id, user_id, course_id, progress, status) VALUES
(1, 2, 2, 40, 'active'),  -- Jefferson Lima matriculado em Jovem Aprendiz com 40%
(2, 3, 1, 60, 'active'),  -- Marta Silva matriculada em Criando Oportunidades com 60%
(3, 4, 3, 15, 'active')   -- Kauan Oliveira matriculado em Formação Musical com 15%
ON DUPLICATE KEY UPDATE id=id;

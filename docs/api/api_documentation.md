# Documentação da API - Portal ABEMCE

A API do portal roda sob o prefixo `/api`. A seguir estão descritos os endpoints disponíveis.

## Autenticação

### 1. Registrar Usuário
* **Rota:** `POST /api/auth/register`
* **Descrição:** Cria uma nova conta de aluno.
* **Corpo da Requisição:**
  ```json
  {
    "name": "João Silva",
    "email": "joao@gmail.com",
    "cpf": "123.456.789-00",
    "password": "senhaSegura123",
    "neighborhood": "Mondubim"
  }
  ```
* **Resposta (201 Created):**
  ```json
  {
    "message": "Usuário registrado com sucesso!"
  }
  ```

### 2. Login de Usuário
* **Rota:** `POST /api/auth/login`
* **Descrição:** Autentica o usuário e gera um token JWT.
* **Corpo da Requisição:**
  ```json
  {
    "emailOrCpf": "joao@gmail.com",
    "password": "senhaSegura123"
  }
  ```
* **Resposta (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 2,
      "name": "João Silva",
      "email": "joao@gmail.com",
      "role": "student"
    }
  }
  ```

---

## Cursos & Inscrições (Alunos)

### 3. Listar Cursos
* **Rota:** `GET /api/courses`
* **Descrição:** Retorna a lista de todos os cursos cadastrados no sistema. Pode ser filtrado por categoria se passado via query parameter.
* **Autenticação:** Requer Token JWT.
* **Query Params (Opcional):** `?category=Música`
* **Resposta (200 OK):**
  ```json
  [
    {
      "id": 1,
      "title": "Formação musical",
      "category": "Música (Banda marcial)",
      "description": "Aulas de sopro, percussão e teoria musical.",
      "image_url": "/src/img/musica.jpg",
      "lessons_count": 20
    }
  ]
  ```

### 4. Inscrever-se em Curso
* **Rota:** `POST /api/courses/:id/enroll`
* **Descrição:** Realiza a inscrição do aluno autenticado no curso especificado pelo ID.
* **Autenticação:** Requer Token JWT (apenas alunos).
* **Resposta (201 Created):**
  ```json
  {
    "message": "Inscrição realizada com sucesso!",
    "enrollmentId": 5
  }
  ```

### 5. Listar Minhas Inscrições
* **Rota:** `GET /api/courses/my-enrollments`
* **Descrição:** Retorna os cursos em que o aluno logado está inscrito, incluindo seu progresso atual.
* **Autenticação:** Requer Token JWT (apenas alunos).
* **Resposta (200 OK):**
  ```json
  [
    {
      "id": 1,
      "course_id": 3,
      "title": "Jovem aprendiz",
      "category": "Qualificação profissional",
      "image_url": "/src/img/jovem_aprendiz.jpg",
      "progress": 40,
      "lessons_count": 10
    }
  ]
  ```

### 6. Atualizar Progresso
* **Rota:** `PUT /api/courses/my-enrollments/:id/progress`
* **Descrição:** Atualiza o progresso em um curso incrementando ou informando o progresso percentual (0 a 100).
* **Autenticação:** Requer Token JWT (apenas alunos).
* **Corpo da Requisição:**
  ```json
  {
    "progress": 50
  }
  ```
* **Resposta (200 OK):**
  ```json
  {
    "message": "Progresso atualizado com sucesso!"
  }
  ```

---

## Administração

### 7. Cadastrar Curso
* **Rota:** `POST /api/courses`
* **Descrição:** Cadastra um novo curso na plataforma.
* **Autenticação:** Requer Token JWT e papel de `admin`.
* **Corpo da Requisição:**
  ```json
  {
    "title": "Artesanato Culinário",
    "category": "Artesanato",
    "description": "Aulas práticas de panificação e doces artesanais.",
    "image_url": "https://exemplo.com/imagem.png",
    "lessons_count": 12
  }
  ```
* **Resposta (201 Created):**
  ```json
  {
    "message": "Curso criado com sucesso!",
    "courseId": 12
  }
  ```

### 8. Painel Administrativo de Métricas
* **Rota:** `GET /api/admin/metrics`
* **Descrição:** Retorna os números totais exibidos nos cards do painel administrativo.
* **Autenticação:** Requer Token JWT e papel de `admin`.
* **Resposta (200 OK):**
  ```json
  {
    "totalStudents": 856,
    "activeCourses": 24,
    "jovensAprendizes": 142,
    "formacaoMusical": 68
  }
  ```

### 9. Listar Matrículas e Alunos Inscritos
* **Rota:** `GET /api/admin/enrollments`
* **Descrição:** Retorna a lista detalhada de alunos e suas respectivas inscrições para exibição na tabela.
* **Autenticação:** Requer Token JWT e papel de `admin`.
* **Resposta (200 OK):**
  ```json
  [
    {
      "studentName": "Jefferson Lima",
      "courseTitle": "Jovem aprendiz",
      "neighborhood": "Parque São José",
      "enrollmentDate": "2026-05-02T10:00:00.000Z"
    }
  ]
  ```

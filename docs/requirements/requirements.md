# Requisitos do Sistema - Portal ABEMCE

Este documento descreve os requisitos funcionais e não funcionais do Portal de Qualificação e Cursos da ABEMCE.

## Requisitos Funcionais (RF)

### RF01: Cadastro de Usuários
* **Descrição:** O sistema deve permitir que novos usuários (alunos) se cadastrem informando Nome, E-mail, CPF, Bairro de Fortaleza, Senha e Confirmação de Senha.
* **Critério de Aceite:** O e-mail e o CPF devem ser únicos. A senha deve ser criptografada antes de ser salva no banco. Por padrão, usuários cadastrados externamente possuem a role `student`.

### RF02: Login de Usuários
* **Descrição:** O sistema deve permitir o login de usuários (alunos e administradores).
* **Critério de Aceite:** O login pode ser efetuado utilizando E-mail ou CPF e a Senha cadastrada. Se as credenciais forem válidas, o servidor retorna um Token JWT contendo as informações e permissões do usuário. O frontend deve redirecionar o administrador para a área administrativa (`/admin/`) e o aluno para a área do aluno (`/student/`).

### RF03: Listar Cursos Disponíveis
* **Descrição:** O sistema deve listar na tela inicial do aluno os cursos de qualificação e formação artística disponíveis.
* **Critério de Aceite:** Os cursos devem ser organizados por categorias (Qualificação profissional, Música, Esporte, Artesanato). O aluno pode filtrar os cursos clicando nos botões de categoria correspondentes.

### RF04: Inscrição em Cursos
* **Descrição:** O aluno deve poder se inscrever nos cursos listados que possuem vagas abertas.
* **Critério de Aceite:** O sistema deve registrar a data da inscrição e iniciar o progresso do aluno em 0%. O aluno não pode se inscrever duas vezes no mesmo curso de forma concorrente.

### RF05: Cadastro de Cursos (Admin)
* **Descrição:** O administrador do sistema deve poder cadastrar novos cursos na plataforma.
* **Critério de Aceite:** O cadastro exige Título do curso, Categoria, Descrição completa, URL de imagem representativa e quantidade de aulas totais.

### RF06: Visualização de Alunos Inscritos (Admin)
* **Descrição:** O administrador deve poder visualizar a lista de alunos inscritos nos programas e cursos.
* **Critério de Aceite:** O dashboard administrativo deve exibir métricas gerais (número de alunos inscritos, cursos ativos, contagem por tipo de programa) e uma tabela com inscrições recentes mostrando Nome do Aluno, Nome do Curso/Programa, Bairro de residência e Data de Inscrição.

---

## Requisitos Não Funcionais (RNF)

* **RNF01: Segurança:** Uso de tokens JWT para rotas autenticadas e `bcryptjs` para hashing de senhas.
* **RNF02: Responsividade:** A interface web deve ser totalmente adaptável para dispositivos móveis, tablets e computadores, eliminando a necessidade de um aplicativo nativo separado.
* **RNF03: Facilidade de Demonstração (Fallback Híbrido):** O backend deve funcionar perfeitamente mesmo sem um servidor MySQL rodando localmente, fazendo fallback para dados simulados em memória quando o banco estiver indisponível.
* **RNF04: Estilo Visual Premium:** A interface deve seguir estritamente o layout e paleta de cores fornecida (Azul ABEMCE `#009ada` e Laranja Vibrante `#f05a28`).

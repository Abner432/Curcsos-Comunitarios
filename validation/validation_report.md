# Relatório de Validação de Requisitos - Portal ABEMCE

Este documento atesta a conformidade do sistema implementado com os requisitos funcionais estabelecidos na especificação do projeto.

## Matriz de Rastreabilidade e Validação

| ID do Requisito | Requisito Descrito | Tela / Endpoint Associado | Status da Implementação | Critério de Validação |
| :--- | :--- | :--- | :--- | :--- |
| **RF01** | Cadastro de Usuários | `register.html`<br>`POST /api/auth/register` | **Implementado** | Envio de formulário de cadastro, validação de campos obrigatórios e gravação com hashing de senha. |
| **RF02** | Login de Usuários | `index.html`<br>`POST /api/auth/login` | **Implementado** | Entrada de CPF ou E-mail, validação de hash e entrega de Token JWT no cabeçalho/localStorage. |
| **RF03** | Listar Cursos Disponíveis | `student/index.html`<br>`GET /api/courses` | **Implementado** | Renderização dinâmica de cards de cursos com filtros interativos via botões de categoria. |
| **RF04** | Inscrição em Cursos | `student/index.html`<br>`POST /api/courses/:id/enroll` | **Implementado** | Clique em "INSCREVER-SE" na interface do aluno, gerando uma matrícula em tempo real com progresso inicial de 0%. |
| **RF05** | Cadastrar Cursos (Admin) | `admin/add_course.html`<br>`POST /api/courses` | **Implementado** | Tela contendo formulário restrito a administradores que adiciona novos cursos ao banco de dados/memória. |
| **RF06** | Visualizar Alunos Inscritos | `admin/index.html`<br>`GET /api/admin/enrollments` | **Implementado** | Tabela dinâmica de "Inscrições Recentes" na área administrativa que consome dados da API de matrícula. |

---

## Evidências de Funcionamento (Logs e Execução)

Para fins de demonstração, o backend conta com um mecanismo de fallback automático:
- Se houver conexão ativa com o MySQL (conforme definido no schema e variáveis de ambiente), os dados persistirão de forma convencional no banco físico.
- Se o banco de dados não estiver disponível, o sistema opera de forma autônoma na memória interna (pré-semeada com as contas fake), apresentando total coerência de dados de forma que todos os RFs possam ser visualizados e interagidos livremente no navegador.

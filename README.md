# Portal de Qualificação e Cursos Estudantis - ABEMCE

Este projeto é uma plataforma de cursos estudantis completa chamada **ABEMCE**, desenvolvida estritamente de acordo com os requisitos estabelecidos. 

A plataforma possui dois tipos de usuários:
* **Administrador:** Cadastra novos cursos, acompanha estatísticas pedagógicas em tempo real, visualiza as inscrições mais recentes e exporta relatórios pedagógicos.
* **Aluno:** Visualiza os cursos disponíveis organizados por categorias, se inscreve em novas qualificações e acompanha seu progresso em tempo real marcando aulas assistidas de forma interativa.

## Contribuição para a ODS 11

A plataforma amplia o acesso da comunidade a cursos, qualificação profissional e atividades sociais, fortalecendo a inclusão e a participação comunitária.

ODS 11 – Cidades e Comunidades Sustentáveis.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend:** HTML5 estrutural, CSS3 customizado, Javascript para consumo de API e manipulação dinâmica do DOM.
* **Backend:** Node.js, Express, JWT (para proteção de rotas e sessões baseadas em papéis) e CORS.
* **Banco de Dados:** Integração completa com **MySQL** com suporte de **Fallback Híbrido** inteligente (em memória).

---

## ⚡ Bancos de Dados Híbrido (Modo Simulado Automático)

Para facilitar o teste imediato da plataforma sem requerer a instalação local e alimentação de um banco MySQL, optamos por esta estratégia:
* O backend **tenta se conectar ao MySQL** utilizando as credenciais fornecidas no arquivo de configuração do sistema ou ambiente.
* Caso a conexão com o MySQL falhe (por exemplo, se o servidor MySQL não estiver rodando no momento), o sistema **ativa de forma transparente o Modo Simulado (In-Memory)**! 
* Este modo carrega uma base de dados em memória semeada com qualificações realistas, matrículas e contas fake prontas para uso. O cadastro de novos alunos, login, inscrição em cursos e atualizações de progresso funcionam no navegador neste modo, assim facilitando a usabilidade de como seria esse projeto funcionando em um cenário real!

### 🔑 Contas Fake de Teste (Semeador)
Você pode utilizar as seguintes credenciais na tela de login para explorar a plataforma:

| Perfil de Usuário | Identificador (E-mail ou CPF) | Senha |
| :--- | :--- | :--- |
| **Aluno (Student)** | `aluno@abemce.org.br` | `aluno123` |
| **Administrador (Admin)** | `admin@abemce.org.br` | `admin123` |

> [!TIP]
> **Facilitador de Testes:** Na tela de login principal (`http://localhost:3000`), há um painel pontilhado chamado **"Demonstrador Rápido"**. Basta clicar em "Entrar como Aluno" ou "Entrar como Admin" para autopreencher os campos e logar instantaneamente com um único clique!

---

## 📂 Estrutura de Pastas do Projeto

O projeto foi estruturado seguindo exatamente o modelo organizacional proposto pelo nosso professor:

```
projeto/ (ABENCE/)
├── README.md
├── docs/
│   ├── requirements/
│   │   └── requirements.md
│   ├── architecture/
│   │   └── architecture.md
│   └── api/
│       └── api_documentation.md
├── validation/
│   ├── target_audience.md
│   ├── validation_report.md
│   ├── evidence/
│   └── feedback/
├── database/
│   └── schema.sql
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js (Gerenciamento MySQL + In-Memory Fallback)
│   │   ├── middleware/
│   │   │   └── auth.js (JWT e Roles Guard)
│   │   ├── routes/
│   │   │   ├── auth.routes.js (RF01 e RF02)
│   │   │   ├── course.routes.js (RF03, RF04 e RF05)
│   │   │   └── student.routes.js (RF06)
│   │   └── server.js
│   ├── tests/
│   │   └── api.test.js (Testes de integração RF01-RF06)
│   └── package.json
└── frontend/
    ├── web/ (Interface responsiva otimizada para Desktop/Mobile)
    │   ├── src/
    │   │   └── css/
    │   │       └── index.css (Identidade visual ABEMCE fiel aos prints)
    │   ├── student/
    │   │   ├── index.html (Filtro de cursos e pílulas do Print 3)
    │   │   └── my_courses.html (Acompanhamento e lições interativas)
    │   ├── admin/
    │   │   ├── index.html (Métricas e inscrições do Print 2)
    │   │   └── add_course.html (Cadastro de cursos)
    │   ├── index.html (Portal de login dividido do Print 1)
    │   ├── register.html (Cadastro de alunos)
    │   └── package.json
    └── mobile/ (Mock de conformidade estrutural)
        ├── src/
        │   └── App.js
        └── package.json
```

---

## 🚀 Como Executar a Aplicação

Como o backend Express foi desenvolvido para servir também os arquivos estáticos do frontend, **você precisa rodar apenas o backend** para ter o ecossistema inteiro funcionando!

### Passo 1: Instalar dependências do Backend
Abra o terminal no diretório do backend (`projeto/backend`) e execute:
```bash
npm install
```
Ou pode usar "npm i".

### Passo 2: Iniciar o Servidor
Com as dependências instaladas, inicie o servidor:
```bash
npm start
```
Você verá logs indicando que a conexão MySQL está sendo tentada e que o modo simulado foi ativado se o banco estiver desligado:
```
========================================================================
🚀 Portal ABEMCE rodando com sucesso!
👉 Acesse a aplicação no navegador em: http://localhost:3000
========================================================================
```

### Passo 3: Testar no Navegador
Abra o navegador de sua preferência e acesse:
**👉 [http://localhost:3000](http://localhost:3000)**

---

## 💾 Configuração opcional com MySQL Físico

Se você desejar testar a plataforma utilizando um banco de dados MySQL físico:
1. Instale e ative o servidor MySQL (através do XAMPP, WampServer ou instalação standalone).
2. Crie um banco de dados chamado `abemce_db` no MySQL e execute as queries presentes no arquivo [database/schema.sql](file:///d:/Projetos%20David/ABENCE/database/schema.sql).
3. Crie um arquivo `.env` no diretório do backend (`projeto/backend/.env`) com as variáveis de conexão:
   ```env
   DB_HOST=localhost
   DB_USER=seu_usuario
   DB_PASSWORD=sua_senha
   DB_NAME=abemce_db
   DB_PORT=3306
   JWT_SECRET=sua_chave_secreta_jwt
   ```
4. Ao reiniciar o servidor com `npm start`, o console exibirá:
   `✅ Conexão com o banco de dados MySQL estabelecida com sucesso!`

---

## 🧪 Como Executar os Testes Automatizados

Desenvolvemos uma suite de testes de integração independente de bibliotecas pesadas de terceiros para garantir a máxima estabilidade e conformidade com as regras pedagógicas da ABEMCE.

Para rodar os testes:
1. Abra o terminal no diretório do backend (`projeto/backend`).
2. Execute o comando:
   ```bash
   npm test
   ```
3. O console exibirá a validação passo a passo da criação de usuários, validação de unicidade de CPF, criptografia de hashes, criação de cursos (RF05), matrículas de alunos (RF04) e retorno dos dados no painel gestor (RF06).

## Criadores do projeto ABEMCE:
Este projeto foi feito pelos alunos do curso Análise e Desenvolvimento de Sistemas da UNIFOR, sendo eles:

David Khauan Santos Lima, Matricula: 2323791
Abner Ferreira Costa, Matricula: 2323829
Mário Sergio Cordeiro Lima, Matricula: 2327073
Eric Vinicius Dias Aquino, Matricula: 2326242
Matheus Ferreira de Queiroz Alves, Matricula: 2323824

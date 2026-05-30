// a gente tem um formulário de login, onde o usuário pode entrar com email ou CPF e senha.
// tem um toggle para alternar entre acesso de aluno e acesso administrativo, que muda o texto e o estilo da página.
// quando o formulário é enviado, a gente faz uma requisição para a API de login, e se for bem sucedida, salva o token e os dados do usuário no localStorage 
// e redireciona para a página correta (admin ou student).
// tem também uma função de toast para mostrar mensagens de sucesso ou erro para o usuário, e um recurso de auto-preenchimento para facilitar os testes.

const loginForm = document.getElementById ("login-form");
const emailOrCpfInput = document.getElementById ("emailOrCpf");
const passwordInput = document.getElementById ("password");
const portalTitle = document.getElementById ("portal-title");
const portalSubtitle = document.getElementById ("portal-subtitle");
const toggleContainer = document.getElementById ("toggle-container");
const btnSubmit = document.getElementById ("btn-submit");
const btnAutofillAluno = document.getElementById("autofill-aluno");
const btnAutofillAdmin = document.getElementById("autofill-admin");
const toastMsg = document.getElementById ("toast-msg");

let isAdminMode = false;

function updateAdminToggleContent() {
  if (isAdminMode) {
    portalTitle.textContent = "Acesso Administrativo";
    portalSubtitle.textContent = "Faça login com suas credenciais de gestor.";

    toggleContainer.innerHTML =
      'Área do estudante? <a href="#" id="link-admin-toggle">Acesso Aluno</a>';
    btnSubmit.textContent = "ACESSAR PAINEL GESTOR";
    btnSubmit.style.backgroundColor = "var(--primary-blue)";
  } else {
    portalTitle.textContent = "Seja bem-vindo";
    portalSubtitle.textContent =
      "Faça login para continuar sua jornada de aprendizado.";

    toggleContainer.innerHTML =
      'Faz parte da equipe? <a href="#" id="link-admin-toggle">Acesso Administrativo</a>';
    btnSubmit.textContent = "ENTRAR NO PORTAL";
    btnSubmit.style.backgroundColor = "var(--primary-orange)";
  }

  const currentToggleLink = document.getElementById("link-admin-toggle");
  if (currentToggleLink) {
    currentToggleLink.addEventListener("click", handleAdminToggle);
  }
}

function handleAdminToggle(event) {
  event.preventDefault();
  isAdminMode = !isAdminMode;
  updateAdminToggleContent();
}

const initialToggleLink = document.getElementById ("link-admin-toggle");
if (initialToggleLink) {
  initialToggleLink.addEventListener("click", handleAdminToggle);
}

function autofill (role) {
  if (role === "aluno") {
    emailOrCpfInput.value = "aluno@abemce.org.br";
    passwordInput.value = "aluno123";

    if (isAdminMode) {
      document.getElementById("link-admin-toggle")?.click();
    }
  } else {
    emailOrCpfInput.value = "admin@abemce.org.br";
    passwordInput.value = "admin123";

    if (!isAdminMode) {
      document.getElementById("link-admin-toggle")?.click();
    }
  }
  showToast ("Campos preenchidos! Clique em Entrar.", "success");
}

window.autofill = autofill;

btnAutofillAluno?.addEventListener("click", () => autofill("aluno"));
btnAutofillAdmin?.addEventListener("click", () => autofill("admin"));

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    emailOrCpf: emailOrCpfInput.value.trim(),
    password: passwordInput.value,
  };

  try {
    const response = await fetch ("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify (payload)
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(
        data.error || "Credenciais inválidas. Tente novamente!",
        "error",
      );
      return;
    }

    localStorage.setItem ("abemce_token", data.token);
    localStorage.setItem ("abemce_user", JSON.stringify(data.user));

    showToast ("Login efetuado! Redirecionando...", "success");

    setTimeout (() => {
      if (data.user.role === "admin") {
        window.location.href = "/admin/index.html";
      } else {
        window.location.href = "/student/index.html";
      }
    }, 1000);
  } catch (error) {
    showToast (
      "Erro de conexão com a API. Verifique se o servidor está rodando!",
      "error",
    );
    console.error(error);
  }
});

function showToast (message, type = "success") {
  toastMsg.textContent = message;
  toastMsg.className = `toast ${type}`;
  toastMsg.style.display = "block";

  setTimeout(() => {
    toastMsg.style.display = "none";
  }, 3000);
}

const cachedUser = localStorage.getItem ("abemce_user");
const cachedToken = localStorage.getItem ("abemce_token");

if (cachedUser && cachedToken) {
  const user = JSON.parse(cachedUser);
  if (user.role === "admin") {
    window.location.href = "/admin/index.html";
  } else {
    window.location.href = "/student/index.html";
  }
}

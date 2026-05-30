// aqui temos a tela de "Sobre Nós" para os alunos, onde eles podem aprender 
// sobre a história e missão da ABEMCE, ver fotos e vídeos das atividades, e 
// entrar em contato para mais informações. A interface é limpa e informativa, 
// com uma linha do tempo interativa que destaca os marcos importantes da organização. 
// Também implementamos um sistema de autenticação para garantir que apenas alunos possam acessar essa página, 
// e adicionamos um botão de logout para facilitar a navegação.

const token = localStorage.getItem("abemce_token");
const user = JSON.parse(localStorage.getItem("abemce_user"));

if (!token || !user || user.role !== "student") {
  localStorage.clear();
  window.location.href = "/index.html";
}

function logout() {
  localStorage.clear();
  window.location.href = "/index.html";
}

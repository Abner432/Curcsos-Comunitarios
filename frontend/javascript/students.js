// fizemos uma implementação mais realista do diretório de alunos, onde cada 
// aluno tem um histórico detalhado de suas matrículas, incluindo o progresso 
// em cada curso. A interface é dinâmica e responsiva, permitindo que os 
// administradores filtrem e pesquisem alunos em tempo real. Também adicionamos 
// mensagens de feedback para ações como carregamento de dados e erros, melhorando 
// a experiência do usuário. O código é modular e organizado para facilitar 
// futuras manutenções e expansões da funcionalidade.

let allStudents = [];

const token = localStorage.getItem("abemce_token");
const user = JSON.parse(localStorage.getItem("abemce_user"));

if (!token || !user || user.role !== "admin") {
  localStorage.clear();
  window.location.href = "/index.html";
}

async function loadDirectory() {
  try {
    const response = await fetch ("/api/admin/students", {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    allStudents = await response.json();

    document.getElementById ("total-badge").textContent = allStudents.length;
    renderDirectory(allStudents);
  } catch (error) {
    console.error(error);
    showToast("Erro ao carregar diretório de alunos.", "error");
  }
}

function renderDirectory (students) {
  const tbody = document.getElementById("students-tbody");

  if (students.length === 0) {
    tbody.innerHTML = `
            <tr>
              <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 40px;">
                Nenhum aluno encontrado correspondente à pesquisa.
              </td>
            </tr>
          `;
    return;
  }

  tbody.innerHTML = students
    .map ((student) => {
      let enrollmentsHtml = "";
      if (student.enrollments.length === 0) {
        enrollmentsHtml = `<span style="font-size: 0.85rem; color: var(--text-muted); font-style: italic;">Nenhuma matrícula ativa</span>`;
      } else {
        enrollmentsHtml = student.enrollments
          .map (
            (event) => `
              <div style="margin-bottom: 12px; font-size: 0.85rem;">
                <div style="display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 4px;">
                  <span>${event.title}</span>
                  <span style="color: ${event.progress >= 100 ? "#2e7d32" : "var(--primary-blue)"};">${event.progress}%</span>
                </div>
                <div class="progress-bar" style="height: 6px;">
                  <div class="progress-fill" style="width: ${event.progress}%; background-color: ${event.progress >= 100 ? "#4caf50" : "var(--primary-blue)"};"></div>
                </div>
              </div>
            `,
          )

          .join("");
      }

      return `
            <tr>
              <td>
                <div style="font-weight: 700; font-size: 1rem; color: var(--text-dark);">${student.name}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Registrado em: ${new Date(student.created_at).toLocaleDateString("pt-BR")}</div>
              </td>
              <td>
                <div style="font-size: 0.9rem;"><i class="fa-regular fa-envelope" style="margin-right: 6px; color: var(--primary-blue);"></i>${student.email}</div>
                <div style="font-size: 0.9rem; margin-top: 6px;"><i class="fa-regular fa-id-card" style="margin-right: 6px; color: var(--primary-orange);"></i>CPF: ${student.cpf}</div>
              </td>
              <td>
                <span style="font-weight: 600; font-size: 0.9rem; background-color: #f1f2f6; padding: 6px 12px; border-radius: 4px; display: inline-block;">
                  ${student.neighborhood}
                </span>
              </td>
              <td>
                <div style="max-height: 150px; overflow-y: auto; padding-right: 5px;">
                  ${enrollmentsHtml}
                </div>
              </td>
            </tr>
          `;
    })

    .join("");
}

document.getElementById("search-input").addEventListener("input", (event) => {
  const searchVal = event.target.value.toLowerCase().trim();

  if (!searchVal) {
    renderDirectory (allStudents);
    return;
  }

  const filtered = allStudents.filter (
    (student) =>
      student.name.toLowerCase().includes(searchVal) ||
      student.email.toLowerCase().includes(searchVal) ||
      student.neighborhood.toLowerCase().includes(searchVal) ||
      student.cpf.includes(searchVal)
  );

  renderDirectory (filtered);
});

function logout() {
  localStorage.clear();
  window.location.href = "/index.html";
}

function showToast (message, type = "success") {
  toastMsg.textContent = message;
  toastMsg.className = `toast ${type}`;
  toastMsg.style.display = "block";

  setTimeout (() => {
    toastMsg.style.display = "none";
  }, 3000);
}

loadDirectory();
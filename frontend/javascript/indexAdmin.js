// colocamos tudo em um arquivo só para evitar muitos requests e otimizar o 
// carregamento do painel administrativo, que é mais "fechado" e tem menos 
// funcionalidades do que a parte pública do site.

const token = localStorage.getItem ("abemce_token");
const user = JSON.parse (localStorage.getItem("abemce_user"));

if (!token || !user || user.role !== "admin") {
  localStorage.clear();
  window.location.href = "/index.html";
}

async function loadAdminData() {
  try {
    const metricsResponse = await fetch("/api/admin/metrics", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const metrics = await metricsResponse.json();

    document.getElementById("metric-students").textContent =
      metrics.totalStudents;
    document.getElementById("metric-courses").textContent =
      metrics.activeCourses;
    document.getElementById("metric-jovens").textContent =
      metrics.jovensAprendizes;
    document.getElementById("metric-musica").textContent =
      metrics.formacaoMusical;

    const enrollResponse = await fetch("/api/admin/enrollments", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const enrollments = await enrollResponse.json();

    renderEnrollments (enrollments);
  } catch (error) {
    console.error(error);
    showToast("Erro ao carregar dados do painel administrativo.", "error");
  }
}

function renderEnrollments (list) {
  const tbody = document.getElementById("enrollments-tbody");

  if (list.length === 0) {
    tbody.innerHTML = `
            <tr>
              <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 40px;">
                Nenhum aluno matriculado até o momento.
              </td>
            </tr>
          `;
    return;
  }

  tbody.innerHTML = list
    .map ((item) => {
      const rawDate = new Date (item.enrollmentDate);
      const formattedDate = rawDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      return `
            <tr>
              <td style="font-weight: 600;">${item.studentName}</td>
              <td>${item.courseTitle}</td>
              <td>${item.neighborhood}</td>
              <td>${formattedDate}</td>
            </tr>
          `;
    })

    .join("");
}

async function exportReport() {
  try {
    const response = await fetch ("/api/admin/export-report", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error();

    const data = await response.json();

    const jsonStr = JSON.stringify (data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = window.URL.createObjectURL (blob);
    const a = document.createElement ("a");

    a.href = url;
    a.download = "relatorio_alunos_abemce.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showToast("Relatório pedagógico exportado com sucesso!", "success");
  } catch (error) {
    showToast("Erro ao exportar relatório.", "error");
  }
}

function logout() {
  localStorage.clear();
  window.location.href = "/index.html";
}

function showToast (message, type = "success") {
  toastMsg.textContent = message;
  toastMsg.className = `toast ${type}`;
  toastMsg.style.display = "block";

  setTimeout(() => {
    toastMsg.style.display = "none";
  }, 3000);
}

loadAdminData();
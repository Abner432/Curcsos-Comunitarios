// aqui temos a tela de cursos disponíveis para os alunos, onde eles podem navegar por diferentes categorias de cursos, 
// ver detalhes e se inscrever. A interface é dinâmica e responsiva, com feedback visual para ações como inscrição e 
// carregamento de dados. Também implementamos um sistema de autenticação simples para garantir que apenas alunos possam 
// acessar essa página, e adicionamos mensagens de erro amigáveis para melhorar a experiência do usuário em caso de ]
// problemas de rede ou servidor.

let allCourses = [];
let myEnrollments = [];
let currentCategory = "Todos";

const token = localStorage.getItem ("abemce_token");
const user = JSON.parse(localStorage.getItem ("abemce_user"));

if (!token || !user || user.role !== "student") {
  localStorage.clear();
  window.location.href = "/index.html";
}

async function loadData() {
  try {
    const enrollResponse = await fetch ("/api/courses/my-enrollments", {
      headers: { Authorization: `Bearer ${token}` },
    });
    myEnrollments = await enrollResponse.json();

    const coursesResponse = await fetch("/api/courses", {
      headers: { Authorization: `Bearer ${token}` },
    });
    allCourses = await coursesResponse.json();

    renderCourses();
  } catch (error) {
    console.error("Erro de rede:", error);
    showToast("Erro ao carregar dados dos cursos!", "error");
  }
}

function filterCategory (category) {
  currentCategory = category;
  const pills = document.querySelectorAll(".category-pill");
  
  pills.forEach ((pill) => {
    if (pill.textContent.trim() === category) {
      pill.classList.add ("active");
    } else {
      pill.classList.remove ("active");
    }
  });

  renderCourses();
}

function renderCourses() {
  const container = document.getElementById("courses-container");
  let filtered = allCourses;

  if (currentCategory !== "Todos") {
    filtered = allCourses.filter(
      (c) => c.category.toLowerCase() === currentCategory.toLowerCase(),
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
          <div style="text-align: center; grid-column: 1/-1; padding: 80px 20px; background-color: var(--white); border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
            <i class="fa-solid fa-folder-open" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 15px;"></i>
            <p style="font-weight: 600; color: var(--text-dark);">Nenhum curso disponível nesta categoria no momento.</p>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 5px;">Tente selecionar outra categoria ou volte mais tarde.</p>
          </div>
        `;
    return;
  }

  container.innerHTML = filtered
    .map ((course) => {
      const enrolled = myEnrollments.find ((event) => event.course_id === course.id);

      let buttonHtml = "";
      if (enrolled) {
        buttonHtml = `<button class="btn-card enrolled"><i class="fa-solid fa-circle-check"></i> JÁ INSCRITO (Ir para Meus Cursos)</button>`;
      } else {
        const actionText = course.title.toLowerCase().includes ("jovem")
          ? "VER VAGAS"
          : "INSCREVER-SE";
        buttonHtml = `<button class="btn-card" onclick="enrollCourse(${course.id}, '${course.title}')">${actionText}</button>`;
      }

      const tagHtml = `<span class="course-tag">QUALIFICAÇÃO</span>`;

      let imgUrl = course.image_url;

      if (
        course.title.toLowerCase().includes("oportunidades") ||
        course.title.toLowerCase().includes("costura")
      ) {
        imgUrl =
          "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600";
      } else if (course.title.toLowerCase().includes("aprendiz")) {
        imgUrl =
          "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600";
      } else if (
        course.title.toLowerCase().includes("música") ||
        course.title.toLowerCase().includes("musical")
      ) {
        imgUrl =
          "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&q=80&w=600";
      } else if (!imgUrl || imgUrl.startsWith("/src")) {
        imgUrl =
          "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=600";
      }

      return `
          <div class="course-card">
            <div class="course-img-wrapper">
              <img src="${imgUrl}" alt="${course.title}" class="course-img">
              ${tagHtml}
            </div>
            <div class="course-body">
              <h3 class="course-title">${course.title}</h3>
              <p class="course-desc">${course.description}</p>
              <div style="margin-top: auto;">
                ${buttonHtml}
              </div>
            </div>
          </div>
        `;
    })
    .join("");
}

async function enrollCourse (courseId, courseTitle) {
  try {
    const response = await fetch (`/api/courses/${courseId}/enroll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      showToast (data.error || "Erro ao realizar inscrição.", "error");
      return;
    }

    showToast (
      `Inscrição no curso "${courseTitle}" concluída com sucesso!`,
      "success",
    );

    setTimeout(() => {
      loadData();
    }, 800);
  } catch (error) {
    console.error ("Erro de conexão:", error);
    showToast ("Erro ao conectar ao servidor. Tente novamente!", "error");
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

loadData();
// fizemos uma implementação mais realista do progresso do aluno, onde cada curso tem um número 
// total de aulas e o progresso é calculado com base em quantas aulas o aluno marcou como concluídas. 
// O progresso é atualizado dinamicamente no servidor sempre que o aluno marca ou desmarca uma aula, e a interface 
// reflete essas mudanças imediatamente. Também adicionamos uma seção de detalhes do curso para mostrar as aulas 
// individuais e permitir que o aluno acompanhe seu progresso de forma mais granular.

let myEnrollments = [];
let activeEnrollment = null;

const token = localStorage.getItem ("abemce_token");
const user = JSON.parse (localStorage.getItem ("abemce_user"));

if (!token || !user || user.role !== "student") {
  localStorage.clear();
  window.location.href = "/index.html";
}

async function loadEnrollments() {
  try {
    const response = await fetch ("/api/courses/my-enrollments", {
      headers: { Authorization: `Bearer ${token}` },
    });

    myEnrollments = await response.json();
    renderEnrollments();
  } catch (error) {
    console.error(error);
    showToast("Erro ao buscar seus cursos cadastrados.", "error");
  }
}

function renderEnrollments() {
  const container = document.getElementById ("my-enrollments-container");

  if (myEnrollments.length === 0) {
    container.innerHTML = `
          <div style="text-align: center; grid-column: 1/-1; padding: 80px 20px; background-color: var(--white); border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
            <i class="fa-solid fa-graduation-cap" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 15px;"></i>
            <p style="font-weight: 600; color: var(--text-dark);">Você não está matriculado em nenhum curso ainda.</p>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 5px; margin-bottom: 20px;">Explore os cursos disponíveis e faça sua matrícula gratuitamente.</p>
            <a href="/student/index.html" class="btn-primary" style="padding: 12px 24px; display: inline-block; width: auto; text-transform: none;">Ver Cursos Disponíveis</a>
          </div>
        `;
    return;
  }

  container.innerHTML = myEnrollments
    .map ((enroll) => {
      let imgUrl = enroll.image_url;

      if (
        enroll.title.toLowerCase().includes("oportunidades") ||
        enroll.title.toLowerCase().includes("costura")
      ) {
        imgUrl =
          "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600";
      } else if (enroll.title.toLowerCase().includes("aprendiz")) {
        imgUrl =
          "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600";
      } else if (
        enroll.title.toLowerCase().includes("música") ||
        enroll.title.toLowerCase().includes("musical")
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
              <img src="${imgUrl}" alt="${enroll.title}" class="course-img">
              <span class="course-tag" style="background-color: var(--primary-blue); color: var(--white);">${enroll.category}</span>
            </div>
            <div class="course-body">
              <h3 class="course-title">${enroll.title}</h3>
              
              <!-- Barra de Progresso Realista -->
              <div class="progress-container" style="margin-bottom: 25px;">
                <div class="progress-header">
                  <span>Progresso do Aluno</span>
                  <span>${enroll.progress}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${enroll.progress}%"></div>
                </div>
              </div>

              <button class="btn-card" style="background-color: var(--primary-blue);" onclick="openCourseDetails(${enroll.id})">
                <i class="fa-solid fa-play"></i> ACOMPANHAR PROGRESSO
              </button>
            </div>
          </div>
        `;
    })

    .join("");
}

function openCourseDetails (enrollmentId) {
  const enroll = myEnrollments.find ((event) => event.id === enrollmentId);
  if (!enroll) return;

  activeEnrollment = enroll;

  document.getElementById("details-course-title").textContent = enroll.title;
  document.getElementById("course-details-section").style.display = "block";

  const lessonsContainer = document.getElementById("lessons-container");
  lessonsContainer.innerHTML = "";

  const completedCount = Math.round(
    (enroll.progress / 100) * enroll.lessons_count,
  );

  for (let index = 1; index <= enroll.lessons_count; index++) {
    const isCompleted = index <= completedCount;
    const item = document.createElement("div");

    item.className = `lesson-item ${isCompleted ? "completed" : ""}`;

    item.innerHTML = `
          <div style="display: flex; align-items: center; gap: 15px;">
            <i class="fa-solid ${isCompleted ? "fa-circle-check" : "fa-circle-play"}" style="color: ${isCompleted ? "#4caf50" : "var(--primary-blue)"}; font-size: 1.2rem;"></i>
            <div>
              <p style="font-weight: 600; font-size: 1rem; color: var(--text-dark);">Aula ${index}: Módulo de Aprendizado ${index}</p>
              <p style="font-size: 0.8rem; color: var(--text-muted);">Conteúdo curricular ABEMCE</p>
            </div>
          </div>
          <input type="checkbox" class="lesson-checkbox" ${isCompleted ? "checked" : ""} onchange="toggleLesson(${index}, this)">
        `;

    lessonsContainer.appendChild(item);
  }

  document
    .getElementById ("course-details-section")
    .scrollIntoView ({ behavior: "smooth" });
}

async function toggleLesson (lessonIndex, checkbox) {
  if (!activeEnrollment) return;

  const item = checkbox.closest(".lesson-item");
  const icon = item.querySelector("i");

  if (checkbox.checked) {
    item.classList.add("completed");
    icon.className = "fa-solid fa-circle-check";
    icon.style.color = "#4caf50";
  } else {
    item.classList.remove("completed");
    icon.className = "fa-solid fa-circle-play";
    icon.style.color = "var(--primary-blue)";
  }

  const checkboxes = document.querySelectorAll (".lesson-checkbox");
  let checkedCount = 0;

  checkboxes.forEach ((check) => {
    if (check.checked) checkedCount++;
  });

  const newProgress = Math.round (
    (checkedCount / activeEnrollment.lessons_count) * 100,
  );

  try {
    const response = await fetch (
      `/api/courses/my-enrollments/${activeEnrollment.id}/progress`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ progress: newProgress }),
      },
    );

    if (!response.ok) {
      showToast("Erro ao atualizar progresso no servidor.", "error");
      return;
    }

    activeEnrollment.progress = newProgress;

    const idx = myEnrollments.findIndex ((event) => event.id === activeEnrollment.id);
    if (idx !== -1) myEnrollments[idx].progress = newProgress;

    renderEnrollments();

    showToast (`Progresso atualizado para ${newProgress}%!`, "success");
  } catch (error) {
    console.error(error);
    showToast("Erro ao conectar ao servidor.", "error");
  }
}

function closeDetails() {
  document.getElementById("course-details-section").style.display = "none";
  activeEnrollment = null;

  window.scrollTo ({ top: 0, behavior: "smooth" });
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

loadEnrollments();
// planejamos utilizar o mesmo sistema de autenticação e autorização do painel 
// administrativo, ou seja, apenas usuários com role "admin" poderão acessar 
// esta página de cadastro de cursos.

const addCourseForm = document.getElementById("add-course-form");
const titleInput = document.getElementById("course-title");
const categoryInput = document.getElementById("course-category");
const lessonsInput = document.getElementById("course-lessons");
const descriptionInput = document.getElementById("course-description");
const imageInput = document.getElementById("course-image");
const toastMsg = document.getElementById("toast-msg");

const token = localStorage.getItem("abemce_token");
const user = JSON.parse(localStorage.getItem("abemce_user"));

if (!token || !user || user.role !== "admin") {
  localStorage.clear();
  window.location.href = "/index.html";
}

addCourseForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    title: titleInput.value.trim(),
    category: categoryInput.value,
    lessons_count: Number(lessonsInput.value),
    description: descriptionInput.value.trim(),
    image_url: imageInput.value.trim() || null
  };

  try {
    const response = await fetch ("/api/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.error || "Erro ao cadastrar curso.", "error");
      return;
    }

    showToast("Curso cadastrado com sucesso!", "success");

    addCourseForm.reset();

    setTimeout(() => {
      window.location.href = "/admin/index.html";
    }, 1200);
  } catch (error) {
    console.error(error);
    showToast("Erro ao conectar ao servidor de API.", "error");
  }
});

function logout() {
  localStorage.clear();
  window.location.href = "/index.html";
}

function showToast(message, type = "success") {
  toastMsg.textContent = message;
  toastMsg.className = `toast ${type}`;
  toastMsg.style.display = "block";
  setTimeout(() => {
    toastMsg.style.display = "none";
  }, 3000);
}
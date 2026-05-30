// Basicamente neste código vamos poder cadastrar um novo usuário, 
// para isso vamos pegar os dados do formulário, validar as senhas e enviar para o backend. 
// Também tem uma função de toast para mostrar mensagens de sucesso ou erro para o usuário.

const registerForm = document.getElementById ("register-form");
const nameInput = document.getElementById ("name");
const emailInput = document.getElementById ("email");
const cpfInput = document.getElementById ("cpf");
const neighborhoodInput = document.getElementById ("neighborhood");
const passwordInput = document.getElementById ("password");
const confirmPasswordInput = document.getElementById ("confirm-password");
const toastMsg = document.getElementById ("toast-msg");

cpfInput.addEventListener ("input", (event) => {
  let val = event.target.value.replace (/\D/g, "");
  if (val.length > 11) val = val.substring (0, 11);

  if (val.length > 9) {
    event.target.value = `${val.substring(0, 3)}.${val.substring(3, 6)}.${val.substring(6, 9)}-${val.substring(9)}`;
  } else if (val.length > 6) {
    event.target.value = `${val.substring(0, 3)}.${val.substring(3, 6)}.${val.substring(6)}`;
  } else if (val.length > 3) {
    event.target.value = `${val.substring(0, 3)}.${val.substring(3)}`;
  } else {
    event.target.value = val;
  }
});

registerForm.addEventListener ("submit", async (event) => {
  event.preventDefault();

  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (password !== confirmPassword) {
    showToast("As senhas digitadas não coincidem!", "error");
    return;
  }

  if (password.length < 6) {
    showToast("A senha precisa ter no mínimo 6 caracteres!", "error");
    return;
  }

  const payload = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    cpf: cpfInput.value.trim(),
    neighborhood: neighborhoodInput.value.trim(),
    password: password,
  };

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.error || "Erro ao efetuar cadastro.", "error");
      return;
    }

    showToast (
      "Conta criada com sucesso! Redirecionando para login...",
      "success",
    );

    setTimeout(() => {
      window.location.href = "/index.html";
    }, 1500);
  } catch (error) {
    showToast("Erro de rede ao cadastrar. Tente novamente!", "error");
    console.error (error);
  }
});

function showToast(message, type = "success") {
  toastMsg.textContent = message;
  toastMsg.className = `toast ${type}`;
  toastMsg.style.display = "block";
  setTimeout(() => {
    toastMsg.style.display = "none";
  }, 3000);
}

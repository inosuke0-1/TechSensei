window.onload = function () {

  google.accounts.id.initialize({
    client_id: "155431170137-gf6jf04gco23d6nq8r2np3sugr25qn5o.apps.googleusercontent.com",
    callback: handleCredentialResponse
  });

  google.accounts.id.renderButton(
    document.getElementById("googleBtn"),
    {
      theme: "filled_black",
      size: "large",
      shape: "pill",
      text: "continue_with",
      width: 300,
      logo_alignment: "left",
      
    }
  );
};

async function handleCredentialResponse(response) {

  const res = await fetch("https://techsensei.onrender.com/auth/google-login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      token: response.credential
    })
  });

  const data = await res.json();

  if (data.success) {

    localStorage.setItem("token", data.token);

    localStorage.setItem("userName", data.user.username);
    localStorage.setItem("userEmail", data.user.email);

    window.location.href = "../chat/chat.html";
  }
}
document.getElementById("cadastroForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const nascimento = document.getElementById("data").value;
  const senha = document.getElementById("password").value;
  const confirmarSenha = document.getElementById("confirmpassword").value;

  const res = await fetch("https://techsensei.onrender.com/auth/register", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username, email, nascimento, senha, confirmarSenha })
  });

  const data = await res.json();

  if (data.success) {
    alert("Cadastro realizado com sucesso!");
    window.location.href = "../login/login.html";
  } else {
    alert(data.error);
  }
});


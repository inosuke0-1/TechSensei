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
      width: "100%",
      logo_alignment: "left",
      borderradius: "25px"
    }
  );
};

async function handleCredentialResponse(response) {

  const res = await fetch("https://techsenseibend.onrender.com/auth/google-login", {
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

    window.location.href = "../../chat/chat.html";
  }
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {

  e.preventDefault();

  const login = document.getElementById("username").value;
  const senha = document.getElementById("password").value;

  const res = await fetch("https://techsenseibend.onrender.com/auth/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ login, senha })
  });

  const data = await res.json();

  if (data.success) {

    localStorage.setItem("token", data.token);

    window.location.href = "../../chat/chat.html";

  } else {

    alert(data.error);
  }
});

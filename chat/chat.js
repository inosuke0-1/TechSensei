// ===============================
// ELEMENTOS DO DOM
// ===============================
const input = document.getElementById("mensagemInput");
const sendBtn = document.getElementById("send-btn");
const display = document.getElementById("mensagensDisplay");

const fileBtn = document.getElementById("fileBtn");
const fileInput = document.getElementById("fileInput");

const micBtn = document.getElementById("mic-btn");
const navFileInput = document.getElementById("navFileInput");

const settingsBtn = document.getElementById("settingsBtn");
const settingsMenu = document.getElementById("settingsMenu");
const logoutBtn = document.getElementById("logoutBtn");

// ===============================
// HISTÓRICO GLOBAL
// ===============================
let currentChatId = Date.now().toString();
const chats = JSON.parse(localStorage.getItem("chats")) || {};

// ===============================
// FUNÇÕES DE HISTÓRICO
// ===============================
const sidebar = document.getElementById("sidebar");
const historyBtn = document.getElementById("historyBtn");
const chatHistoryEl = document.getElementById("chatHistory");
const clearHistoryBtn = document.getElementById("clearHistory");

// Alterna o painel
historyBtn.addEventListener("click", () => {
  sidebar.classList.toggle("show");
});

// Salva mensagem no histórico
function saveMessage(text, type) {
  if (!chats[currentChatId]) chats[currentChatId] = [];
  chats[currentChatId].push({
    text,
    type,
    time: new Date().toISOString()
  });
  localStorage.setItem("chats", JSON.stringify(chats));
}

// Renderiza histórico
function renderHistory() {
  chatHistoryEl.innerHTML = "";

  const keys = Object.keys(chats).sort((a, b) => b - a);
  if (keys.length === 0) {
    chatHistoryEl.innerHTML = "<p style='color:#ccc; text-align:center;'>Sem histórico...</p>";
    return;
  }

  keys.forEach(id => {
    const item = document.createElement("div");
    item.classList.add("chat-item");
    const date = new Date(parseInt(id));
    item.innerText = date.toLocaleString();

    item.addEventListener("click", () => {
      loadChat(id);
      sidebar.classList.remove("show");
    });

    chatHistoryEl.appendChild(item);
  });
}

// Carrega conversa por id
function loadChat(id) {
  currentChatId = id;
  display.innerHTML = "";

  const messages = chats[id] || [];
  messages.forEach(msg => {
    const div = document.createElement("div");
    div.classList.add("mensagem", msg.type);
    div.innerHTML = marked.parse(msg.text);
    display.appendChild(div);
  });

  display.scrollTop = display.scrollHeight;
}

// Limpa histórico
clearHistoryBtn.addEventListener("click", () => {
  const confirmClear = confirm("Deseja realmente apagar todo o histórico?");
  if (!confirmClear) return;

  localStorage.removeItem("chats");
  Object.keys(chats).forEach(k => delete chats[k]);
  display.innerHTML = "";
  renderHistory();
});

// Atualiza histórico ao iniciar
renderHistory();

// ===============================
// NOVO CHAT (Botão já existente)
// ===============================
document.getElementById("newChatBtn").addEventListener("click", () => {
  currentChatId = Date.now().toString();
  chats[currentChatId] = [];
  localStorage.setItem("chats", JSON.stringify(chats));
  display.innerHTML = "";
  input.value = "";
  renderHistory();
});

// ===============================
// FUNÇÃO DE ADIÇÃO DE MENSAGENS
// ===============================
function addMessage(text, type) {
  const div = document.createElement("div");
  div.classList.add("mensagem", type);
  div.innerHTML = marked.parse(text);
  display.appendChild(div);
  display.scrollTop = display.scrollHeight;
  saveMessage(text, type);
}

// ===============================
// ENVIAR MENSAGEM
// ===============================
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  const typing = document.createElement("div");
  typing.classList.add("mensagem", "bot");
  typing.innerHTML = `
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  display.appendChild(typing);

  try {
    const response = await fetch("https://techsenseibend.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await response.json();
    typing.remove();
    addMessage(data.response, "bot");
  } catch (err) {
    typing.remove();
    addMessage("❌ Erro ao conectar com o servidor.", "bot");
  }
}

sendBtn.addEventListener("click", (e) => {
  e.preventDefault();
  sendMessage();
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ===============================
// UPLOAD DE ARQUIVOS
// ===============================
fileBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return;

  addMessage(`📎 Enviando arquivo: **${file.name}**`, "user");

  const formData = new FormData();
  formData.append("file", file);

  const typing = document.createElement("div");
  typing.classList.add("mensagem", "bot");
  typing.innerHTML = `
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  display.appendChild(typing);

  try {
    const response = await fetch("https://techsenseibend.onrender.com", {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    typing.remove();
    addMessage(data.response, "bot");

  } catch (err) {
    typing.remove();
    addMessage("❌ Erro ao enviar arquivo.", "bot");
  }
});

// ===============================
// UPLOAD VIA NAVBAR
// ===============================
document.getElementById("uploadBtn").addEventListener("click", () => {
  navFileInput.click();
});

navFileInput.addEventListener("change", async () => {
  const file = navFileInput.files[0];
  if (!file) return;
  addMessage(`📎 Arquivo enviado: **${file.name}**`, "user");
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("https://techsenseibend.onrender.com", {
    method: "POST",
    body: formData
  });
  const data = await response.json();
  addMessage(data.response, "bot");
  navFileInput.value = "";
});

// ===============================
// Resto do seu código (STT, navbar, perfil, crop, etc...)
// ===============================

  // ===============================
  // STT (RECONHECIMENTO DE VOZ)
  // ===============================
  let recognition;

  if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;

    recognition.onresult = e => {
      const text = e.results[0][0].transcript;
      input.value = text;
      sendMessage();
    };
  }

  micBtn.addEventListener("click", () => {
    if (!recognition)
      return alert("Seu navegador não suporta reconhecimento de voz.");
    recognition.start();
  });

  // ===============================
  // NAVBAR
  // ===============================
  document.getElementById("homeBtn").addEventListener("click", () => {
    window.location.href = "../principal/ia1.html";
  });

  document.getElementById("newChatBtn").addEventListener("click", () => {
    currentChatId = Date.now();
    chats[currentChatId] = [];
    display.innerHTML = "";
    input.value = "";
  });

  // ===============================
  // CONFIGURAÇÕES
  // ===============================
  settingsBtn.addEventListener("click", () => {
    settingsMenu.classList.toggle("open");
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    alert("Você saiu da conta.");
    window.location.href = "../principal/ia1.html";
  });

  // ==== PROFILE MODAL ====
const openProfileBtn = document.getElementById("openProfileBtn");
const profileModal = document.getElementById("profileModal");
const closeProfileBtn = document.getElementById("closeProfileBtn");
const logoutProfileBtn = document.getElementById("logoutProfileBtn");

openProfileBtn.addEventListener("click", () => {
  profileModal.classList.remove("hidden");
});

closeProfileBtn.addEventListener("click", () => {
  profileModal.classList.add("hidden");
});

logoutProfileBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  alert("Você saiu da conta.");
  window.location.href = "../principal/ia1.html";
});

// ==== EDIT PHOTO ====
const editPhotoBtn = document.getElementById("editPhotoBtn");
const profilePhotoInput = document.getElementById("profilePhotoInput");
const profileImg = document.getElementById("profileImg");

editPhotoBtn.addEventListener("click", () => {
  profilePhotoInput.click();
});

profilePhotoInput.addEventListener("change", () => {
  const file = profilePhotoInput.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  profileImg.src = url;
});

// Fecha o modal clicando fora da caixa
window.addEventListener("click", (e) => {
  if (e.target === profileModal) {
    profileModal.classList.add("hidden");
  }
});
// ===== CROP =====
const cropModal = document.getElementById("cropModal");
const cropImage = document.getElementById("cropImage");
const cropCancelBtn = document.getElementById("cropCancelBtn");
const cropConfirmBtn = document.getElementById("cropConfirmBtn");

let cropperInstance; // guarda instância do Cropper

profilePhotoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);

  cropImage.src = url;
  cropModal.classList.remove("hidden");

  // Inicializa cropper
  if (cropperInstance) cropperInstance.destroy();
  cropperInstance = new Cropper(cropImage, {
    aspectRatio: 1,
    viewMode: 1,
    autoCropArea: 1,
  });
});

// Fecha crop clicando fora
cropModal.addEventListener("click", (e) => {
  if (e.target === cropModal) {
    closeCropModal();
  }
});

function closeCropModal() {
  cropModal.classList.add("hidden");
  if (cropperInstance) {
    cropperInstance.destroy();
    cropperInstance = null;
  }
}

// Cancelar
cropCancelBtn.addEventListener("click", () => {
  closeCropModal();
});

// Confirmar corte
cropConfirmBtn.addEventListener("click", () => {
  if (!cropperInstance) return;

  const canvas = cropperInstance.getCroppedCanvas({
    width: 200,
    height: 200,
  });

  const croppedUrl = canvas.toDataURL("image/png");

 profileImg.src = croppedUrl;
 localStorage.setItem("userPhoto", croppedUrl);


  closeCropModal();
});

// Função para carregar os dados de perfil
function loadUserProfile() {
  const profileName = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");
  const profileImg = document.getElementById("profileImg");

  const savedName = localStorage.getItem("userName");
  const savedEmail = localStorage.getItem("userEmail");
  const savedPhoto = localStorage.getItem("userPhoto");

  if (savedName) profileName.textContent = savedName;
  if (savedEmail) profileEmail.textContent = savedEmail;
  if (savedPhoto) profileImg.src = savedPhoto;
}

// Chama ao carregar a página
document.addEventListener("DOMContentLoaded", loadUserProfile);

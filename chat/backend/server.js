const express = require("express");

require("dotenv").config();
const cors = require("cors");

const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const connectDB = require("./database");
const authRoutes = require("./auth");
const googleAuth = require("./googleAuth");

const app = express(); 
app.use(express.json());

app.use("/auth", googleAuth);


app.use(cors({
  origin: ["https://techsensei-1.onrender.com"],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());
connectDB();


app.use(bodyParser.json());
app.use("/auth", authRoutes);


const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ response: "⚠ Nenhum arquivo recebido." });

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const mime = req.file.mimetype || "";

    if (mime.startsWith("text/") || mime === "application/json" || mime.includes("xml")) {
      const fileContent = fs.readFileSync(filePath, "utf8");

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        
        fs.unlinkSync(filePath);
        return res.status(500).json({ response: "⚠ GEMINI_API_KEY não configurada no servidor." });
      }

      const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));


      const data = await responseIA.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "⚠ Não consegui interpretar o arquivo.";

      fs.unlinkSync(filePath);

      return res.json({ response: text });
    } else {
      
      return res.json({
        response: `✅ Arquivo "${fileName}" recebido com sucesso. (tipo: ${mime}). ` +
                  `Arquivos binários não são lidos automaticamente; você pode baixar em /uploads/${path.basename(filePath)}`
      });
    }
  } catch (err) {
    console.error("Erro no /upload:", err);
    return res.status(500).json({ response: "❌ Erro interno no servidor ao processar o arquivo." });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const userMsg = req.body.message || "";
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ response: "⚠ GEMINI_API_KEY não configurada." });

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        contents: [{ parts: [{ text: userMsg }] }]
        }),
      }
    );

    

    const data = await response.json();
    
    console.log("===== RESPOSTA GEMINI =====");
    console.log(JSON.stringify(data, null, 2));
    console.log("===========================");
    
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠ O modelo não respondeu.";

    res.json({ response: text });
  } catch (err) {
    console.error("Erro no /chat:", err);
    res.status(500).json({ response: "❌ Erro ao conectar com a IA." });
  }
});
app.post("/save-history", (req, res) => {
  try {
    fs.writeFileSync("chat-history.json", JSON.stringify(req.body.history || [], null, 2));
    res.json({ status: "ok" });
  } catch (err) {
    console.error("Erro ao salvar histórico:", err);
    res.status(500).json({ status: "error" });
  }
});
app.use("/uploads", express.static(UPLOAD_DIR));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🟢 Server funcionando na porta ${PORT}`));



const express = require("express");
const router = express.Router();
const User = require("../backend/models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/register", async (req, res) => {
  const { username, email, nascimento, senha, confirmarSenha } = req.body;

  if (senha !== confirmarSenha) {
    return res.status(400).send({ error: "As senhas não coincidem." });
  }

  try {
    const userExiste = await User.findOne({ username });
    if (userExiste) {
      return res.status(400).send({ error: "Nome de usuário já existe." });
    }

    const emailExiste = await User.findOne({ email });
    if (emailExiste) {
      return res.status(400).send({ error: "Email já está cadastrado." });
    }

    const hash = await bcrypt.hash(senha, 10);

    await User.create({
      username,
      email,
      nascimento,
      senha: hash
    });

    res.send({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Erro no servidor." });
  }
});

router.post("/login", async (req, res) => {
  const { login, senha } = req.body;

  try {
    let user = await User.findOne({ username: login });

    if (!user) user = await User.findOne({ email: login });

    if (!user) {
      return res.status(400).send({ error: "Usuário não encontrado." });
    }

    const ok = await bcrypt.compare(senha, user.senha);
    if (!ok) {
      return res.status(400).send({ error: "Senha incorreta." });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.send({ success: true, token });
    
  } catch (err) {
    res.status(500).send({ error: "Erro no servidor." });
  }
});

module.exports = router;

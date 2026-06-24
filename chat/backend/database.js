const mongoose = require("mongoose");

function connectDB() {
  mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("📦 MongoDB conectado!"))
    .catch(err => console.error("❌ Erro ao conectar MongoDB:", err));
}

module.exports = connectDB;

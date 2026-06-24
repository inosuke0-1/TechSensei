const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email:    { type: String, unique: true, required: true },
  nascimento: { type: String, required: true },
  senha: { type: String, required: true },
  
  googleId: {type: String},
  avatar: {type: String}
});

module.exports = mongoose.model("User", UserSchema);

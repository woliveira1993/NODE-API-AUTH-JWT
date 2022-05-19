const moongose = require("mongoose");
const Usuario = moongose.model("Usuario", {
  nome: String,
  senha: String,
  email: String,
  telefone: Number,
});

module.exports = Usuario;

// imports
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const app = express();

//Configurar JSON express
app.use(express.json());

//routes
const usuariosRoute = require("./routes/usuariosRoute");
app.use("/auth", usuariosRoute);

// credenciais e conexao do mongodb
const DBUSER = process.env.DB_USER;
const DBPASS = process.env.DB_PASS;
mongoose
  .connect(
    `mongodb+srv://${DBUSER}:${DBPASS}@cluster0.q6six.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("Conectado ao banco com sucesso!");
    app.listen(3000);
  })
  .catch((err) => console.log(err));

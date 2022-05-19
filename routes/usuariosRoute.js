const router = require("express").Router();
const bcrypt = require("bcrypt");
const res = require("express/lib/response");
const jwt = require("jsonwebtoken");
//Models
const Usuario = require("../models/Usuario");

//autorização token
function checarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Acesso negado!" });
  }

  try {
    const secret = process.env.SECRET;
    jwt.verify(token, secret);
    next();
  } catch (error) {
    return res.status(400).json({ msg: "Token invalido!" });
  }
}

//Login do usuario
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  //validações do login
  if (!email) {
    return res
      .status(422)
      .json({ msg: "Você precisa inserir um email para fazer o login!" });
  }

  if (!senha) {
    return res
      .status(422)
      .json({ msg: "Você precisa inserir uma senha para fazer o login!" });
  }

  //checa se o usuario existe
  const usuario = await Usuario.findOne({ email: email });
  if (!usuario) {
    return res.status(422).json({ msg: "Esse usuario nao existe!" });
  }

  //checa se a senha bate
  const checaSenha = await bcrypt.compare(senha, usuario.senha);
  if (!checaSenha) {
    return res.status(200).json({ msg: "A senha inserida está incorreta!" });
  }

  try {
    const secret = process.env.secret;
    const assinatura = jwt.sign(
      {
        id: usuario._id,
      },
      secret
    );

    return res
      .status(200)
      .json({ msg: "Usuario logado com sucesso!", assinatura });
  } catch (error) {
    console.log(error);
    return res
      .status(422)
      .json({ msg: "Ocorreu um erro no servidor,tente novamente mais tarde" });
  }
});

//Registro de usuario
//Recebe os dados do formulario (nome, email, senha, telefone) no metodo POST
router.post("/register", async (req, res) => {
  const { nome, senha, email, telefone } = req.body;

  //validações
  if (!nome) {
    return res.status(422).json({ msg: "O nome do usuario é obrigatorio!" });
  }
  if (!senha) {
    return res.status(422).json({ msg: "A senha é obrigatorio!" });
  }
  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatorio!" });
  }
  if (!telefone) {
    return res.status(422).json({ msg: "O telefone é obrigatorio!" });
  }

  //checa se já existe um usuario cadastrado
  const checaUsuario = await Usuario.findOne({ email: email });
  if (checaUsuario) {
    return res.status(422).json({ msg: "Já existe um usuario cadastrado!" });
  }

  //gerador hash password
  const salt = await bcrypt.genSalt(12);
  const passHash = await bcrypt.hash(senha, salt);

  //criar o usuario
  const usuario = new Usuario({
    nome,
    email,
    senha: passHash,
    telefone,
  });

  //salva o usuario no banco de dados
  try {
    await usuario.save();
    return res.status(200).json({ msg: "O usuario foi criado com sucesso!" });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

//puxar todos os usuarios - private
router.get("/users", checarToken, async (req, res) => {
  const usuario = await Usuario.find();
  if (!usuario) {
    return res.status(404).json({ msg: "Nenhum usuario foi encontrado!" });
  }

  try {
    return res.status(200).json({ usuario });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Ocorreu um erro no nosso servidor, tente novamente mais tarde!",
    });
  }
});

//puxa um usuario por id - private
router.get("/users/:id", checarToken, async (req, res) => {
  const id = req.params.id;
  const usuario = await Usuario.findById(id, "-senha");

  if (!usuario) {
    return res
      .status(422)
      .json({ msg: "Nao foi encontrado nenhum usuario com esse id" });
  }

  try {
    return res.status(200).json({ usuario });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Ocorreu um erro no nosso servidor, tente novamente mais tarde!",
    });
  }
});
module.exports = router;

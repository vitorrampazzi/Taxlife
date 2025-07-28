require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexão com o banco de dados
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conectado ao banco de dados MySQL!');
  }
});

// Rota para cadastrar um novo usuário
app.post('/api/usuarios', (req, res) => {
  const { nome, email, senha } = req.body;

  const sql = 'INSERT INTO users (Name, Email, Senha) VALUES (?, ?, ?)';
  db.query(sql, [nome, email, senha], (err, result) => {
    if (err) {
      console.error('Erro ao cadastrar usuário:', err);
      res.status(500).json({ erro: 'Erro ao cadastrar usuário' });
    } else {
      res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
    }
  });
});

// Rota para cadastrar um novo taxista
app.post('/api/taxistas', (req, res) => {
  const { nome, email, senha, modelo, placa, avaliado } = req.body;

  const sql = 'INSERT INTO drivers (Name, email, password, car_model, car_license_plate, Avaliado) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [nome, email, senha, modelo, placa, avaliado], (err, result) => {
    if (err) {
      console.error('Erro ao cadastrar taxista:', err);
      res.status(500).json({ erro: 'Erro ao cadastrar taxista' });
    } else {
      res.status(201).json({ mensagem: 'Taxista cadastrado com sucesso!' });
    }
  });
});

// Rota de teste
app.get('/', (req, res) => {
  res.send('Servidor está rodando! 🚕');
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

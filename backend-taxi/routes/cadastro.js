// routes/cadastro.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Rota para cadastro de usuário
router.post('/usuario', (req, res) => {
  const { nome, email, senha } = req.body;
  const query = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
  db.query(query, [nome, email, senha], (err, results) => {
    if (err) return res.status(500).json({ erro: err });
    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
  });
});

// Rota para cadastro de taxista
router.post('/taxista', (req, res) => {
  const { nome, email, senha, cnh } = req.body;
  const query = 'INSERT INTO taxistas (nome, email, senha, cnh) VALUES (?, ?, ?, ?)';
  db.query(query, [nome, email, senha, cnh], (err, results) => {
    if (err) return res.status(500).json({ erro: err });
    res.status(201).json({ mensagem: 'Taxista cadastrado com sucesso!' });
  });
});

module.exports = router;

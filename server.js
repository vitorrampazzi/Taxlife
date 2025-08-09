require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


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

app.post('/api/usuarios', async (req, res) => {
  const { Name, Email, Senha } = req.body; 

  if (!Name || !Email || !Senha) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios: Nome, Email, Senha.' });
  }

  try {
    const checkEmailSql = 'SELECT idusers FROM tb_usuarios WHERE Email = ?'; // Nome da tabela: tb_usuarios
    db.query(checkEmailSql, [Email], async (checkErr, checkResults) => {
      if (checkErr) {
        console.error('Erro ao verificar email de usuário existente:', checkErr);
        return res.status(500).json({ erro: 'Erro interno ao verificar email.' });
      }
      if (checkResults.length > 0) {
        return res.status(409).json({ erro: 'Este email já está cadastrado.' });
      }

      const hashedPassword = await bcrypt.hash(Senha, 10); 

      const sql = 'INSERT INTO tb_usuarios (Name, Email, Senha) VALUES (?, ?, ?)'; // Nome da tabela: tb_usuarios
      db.query(sql, [Name, Email, hashedPassword], (err, result) => {
        if (err) {
          console.error('Erro ao cadastrar usuário:', err);
          if (err.code === 'ER_DUP_ENTRY') { 
            return res.status(409).json({ erro: 'Este email já está cadastrado.' });
          }
          return res.status(500).json({ erro: 'Erro interno ao cadastrar usuário.' });
        } else {
          res.redirect('/index.html');
        }
      });
    });

  } catch (error) {
    console.error('Erro ao gerar hash da senha:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

app.post('/api/taxistas', async (req, res) => {
  const { Name, email, password, car_model, car_license_plate } = req.body; 

  if (!Name || !email || !password || !car_model || !car_license_plate) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios: Nome, Email, Senha, Modelo do Carro, Placa do Carro.' });
  }

  try {
    const checkEmailSql = 'SELECT Id_taxistas FROM tb_taxistas WHERE email = ?'; // Nome da tabela: tb_taxistas
    db.query(checkEmailSql, [email], async (checkErr, checkResults) => {
      if (checkErr) {
        console.error('Erro ao verificar email de taxista existente:', checkErr);
        return res.status(500).json({ erro: 'Erro interno ao verificar email.' });
      }
      if (checkResults.length > 0) {
        return res.status(409).json({ erro: 'Este email já está cadastrado como taxista.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const Avaliado = false; 

      const sql = 'INSERT INTO tb_taxistas (Name, email, password, car_model, car_license_plate, Avaliado) VALUES (?, ?, ?, ?, ?, ?)'; // Nome da tabela: tb_taxistas
      db.query(sql, [Name, email, hashedPassword, car_model, car_license_plate, Avaliado], (err, result) => {
        if (err) {
          console.error('Erro ao cadastrar taxista:', err);

          if (err.code === 'ER_DUP_ENTRY') {
            let errorMessage = 'Já existe um cadastro com este email ou placa.';
            if (err.sqlMessage && err.sqlMessage.includes('email')) {
              errorMessage = 'Este email já está cadastrado como taxista.';
            } else if (err.sqlMessage && err.sqlMessage.includes('car_license_plate')) {
              errorMessage = 'Esta placa já está cadastrada.';
            }
            return res.status(409).json({ erro: errorMessage });
          }
          return res.status(500).json({ erro: 'Erro interno ao cadastrar taxista.' });
        } else {
          res.redirect('/index.html');
        }
      });
    });
  } catch (error) {
    console.error('Erro ao gerar hash da senha:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});


app.post('/api/login-usuario', async (req, res) => {
  const { email, password } = req.body; 

  if (!email || !password) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
  }
  const sql = 'SELECT idusers, Name, Email, Senha FROM tb_usuarios WHERE Email = ?'; // Nome da tabela: tb_usuarios
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error('Erro ao fazer login de usuário:', err);
      return res.status(500).json({ erro: 'Erro interno do servidor' });
    }

    if (results.length === 0) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }

    const user = results[0];
    try {
      const isMatch = await bcrypt.compare(password, user.Senha);

      if (isMatch) {
        const { Senha, ...userData } = user;
        res.status(200).json({ mensagem: 'Login de usuário bem-sucedido', usuario: userData });
      } else {
        res.status(401).json({ erro: 'Email ou senha inválidos' });
      }
    } catch (error) {
      console.error('Erro ao comparar senhas:', error);
      res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
  });
});

app.post('/api/login-taxista', async (req, res) => {
  const { email, password } = req.body; 

  if (!email || !password) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
  }

  const sql = 'SELECT Id_taxistas, Name, email, password, car_model, car_license_plate FROM tb_taxistas WHERE email = ?'; // Nome da tabela: tb_taxistas
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error('Erro ao fazer login de taxista:', err);
      return res.status(500).json({ erro: 'Erro interno do servidor' });
    }

    if (results.length === 0) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }

    const driver = results[0];
    try {
      const isMatch = await bcrypt.compare(password, driver.password);

      if (isMatch) {
        const { password, ...driverData } = driver;
        res.status(200).json({ mensagem: 'Login de taxista bem-sucedido', taxista: driverData });
      } else {
        res.status(401).json({ erro: 'Email ou senha inválidos' });
      }
    } catch (error) {
      console.error('Erro ao comparar senhas:', error);
      res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
  });
});

app.get('/api/usuarios', (req, res) => {
  const sql = 'SELECT idusers, Name, Email FROM tb_usuarios'; // Nome da tabela: tb_usuarios
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuários:', err);
      res.status(500).json({ erro: 'Erro ao buscar usuários' });
    } else {
      res.status(200).json(results);
    }
  });
});

app.get('/api/taxistas', (req, res) => {
  const sql = 'SELECT Id_taxistas, Name, email, car_model, car_license_plate, Avaliado FROM tb_taxistas'; // Nome da tabela: tb_taxistas
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar taxistas:', err);
      res.status(500).json({ erro: 'Erro ao buscar taxistas' });
    } else {
      res.status(200).json(results);
    }
  });
});

app.delete('/api/usuarios/:id', (req, res) => {
  const userId = req.params.id;
  const sql = 'DELETE FROM tb_usuarios WHERE idusers = ?';// Nome da tabela: tb_usuarios
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Erro ao excluir usuário:', err);
      return res.status(500).json({ erro: 'Erro interno ao excluir usuário.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    res.status(200).json({ mensagem: 'Usuário excluído com sucesso.' });
  });
});

app.delete('/api/taxistas/:id', (req, res) => {
  const driverId = req.params.id;
  const sql = 'DELETE FROM tb_taxistas WHERE Id_taxistas = ?'; // Nome da tabela: tb_taxistas
  db.query(sql, [driverId], (err, result) => {
    if (err) {
      console.error('Erro ao excluir taxista:', err);
      return res.status(500).json({ erro: 'Erro interno ao excluir taxista.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Taxista não encontrado.' });
    }
    res.status(200).json({ mensagem: 'Taxista excluído com sucesso.' });
  });
});


app.get('/', (req, res) => {
  res.send('Servidor está rodando! 😁');
});

app.use(express.static('public'));

app.get('/index.html', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
app.get('/cadastroUsuario.html', (req, res) => {
  res.sendFile(__dirname + '/public/cadastroUsuario.html');
});
app.get('/cadastroTaxista.html', (req, res) => {
  res.sendFile(__dirname + '/public/cadastroTaxista.html');
});


app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
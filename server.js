require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt'); 

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


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

// --- ROTAS DE CADASTRO ---

app.post('/api/usuarios', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios: Nome, Email, Senha.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // 10 é o saltRounds

    const sql = 'INSERT INTO users (Name, Email, Senha) VALUES (?, ?, ?)';
    db.query(sql, [name, email, hashedPassword], (err, result) => {
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
  } catch (error) {
    console.error('Erro ao gerar hash da senha:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

app.post('/api/taxistas', async (req, res) => {
  const { name, email, password, car_model, car_license_plate } = req.body;

  // Validar se todos os campos necessários estão presentes
  if (!name || !email || !password || !car_model || !car_license_plate) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios: Nome, Email, Senha, Modelo do Carro, Placa do Carro.' });
  }

  try {
    // Gerar hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    const avaliado = false; // Valor padrão, pode ser removido se o DB tiver DEFAULT FALSE

    const sql = 'INSERT INTO drivers (Name, email, password, car_model, car_license_plate, Avaliado) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [name, email, hashedPassword, car_model, car_license_plate, avaliado], (err, result) => {
      if (err) {
        console.error('Erro ao cadastrar taxista:', err);

        // Erro de email ou placa duplicada (ER_DUP_ENTRY)
        if (err.code === 'ER_DUP_ENTRY') {
          let errorMessage = 'Já existe um cadastro com este email ou placa.';
          // Você pode tentar ser mais específico aqui, se for importante diferenciar
          if (err.sqlMessage && err.sqlMessage.includes('email')) {
            errorMessage = 'Este email já está cadastrado como taxista.';
          } else if (err.sqlMessage && err.sqlMessage.includes('car_license_plate')) {
            errorMessage = 'Esta placa já está cadastrada.';
          }
          return res.status(409).json({ erro: errorMessage });
        }
        // Se não for ER_DUP_ENTRY, é outro erro do BD
        return res.status(500).json({ erro: 'Erro interno ao cadastrar taxista.' });
      } else {
        // Redireciona o usuário para a página inicial após o cadastro
        res.redirect('/index.html');
        // res.status(201).json({ mensagem: 'Taxista cadastrado com sucesso!' });
      }
    });
  } catch (error) {
    console.error('Erro ao gerar hash da senha:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// --- ROTAS DE LOGIN ---

app.post('/api/login-usuario', async (req, res) => {
  const { email, password } = req.body; // 'password' vem do HTML

  if (!email || !password) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
  }

  // Coluna 'Senha' na tabela 'users'
  const sql = 'SELECT idusers, Name, Email, Senha FROM users WHERE Email = ?';
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
      // Comparar a senha fornecida com o hash armazenado
      const isMatch = await bcrypt.compare(password, user.Senha);

      if (isMatch) {
        // Remover a senha do objeto do usuário antes de enviar a resposta
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
  const { email, password } = req.body; // 'password' vem do HTML

  if (!email || !password) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
  }

  // Colunas 'email' e 'password' na tabela 'drivers'
  const sql = 'SELECT Id_taxistas, Name, email, password, car_model, car_license_plate FROM drivers WHERE email = ?';
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
      // Comparar a senha fornecida com o hash armazenado
      const isMatch = await bcrypt.compare(password, driver.password);

      if (isMatch) {
        // Remover a senha do objeto do taxista antes de enviar a resposta
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

// --- ROTAS DE LISTAGEM ---

// Rota para obter todos os usuários
app.get('/api/usuarios', (req, res) => {
  const sql = 'SELECT idusers, Name, Email FROM users'; // Não retornar a senha
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuários:', err);
      res.status(500).json({ erro: 'Erro ao buscar usuários' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Rota para obter todos os taxistas
app.get('/api/taxistas', (req, res) => {
  const sql = 'SELECT Id_taxistas, Name, email, car_model, car_license_plate, Avaliado FROM drivers'; // Não retornar a senha
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar taxistas:', err);
      res.status(500).json({ erro: 'Erro ao buscar taxistas' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Rota de teste
app.get('/', (req, res) => {
  res.send('Servidor está rodando! ��');
});

// Servir arquivos estáticos (HTML, CSS, JS)
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


// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
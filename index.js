const express = require('express')
const cookieSession = require('cookie-session')
const app = express()
const port = 3000

//app.use(express.static('index'));
app.use(express.static(__dirname + '/public'));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(cookieSession({
  name: 'ufc-web-session',
  secret: 'c293x8b6234z82n938246bc2938x4zb234',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const mongoRepository = require('./repositorios/mongo-repository');

app.get('/logout', (req, res) => {
  req.session = null
  res.redirect('/')
})

app.get('/', async (req, res) => {
  //console.log('=== GET - /');

  try {
    const cars = await mongoRepository.getAllCars();
    res.render('home', { cars });
  } catch (error) {
    console.error(error);
    res.render('error', { error: 'Erro ao obter os carros' });
  }
});

app.get('/signin', (req, res) => {
  //console.log('=== GET - /signin');
  res.render('singin', { error: null });
});


app.post('/signin', async (req, res) => {
  //console.log('=== POST - /signin');
  const { email, password } = req.body;

  try {
    // Verifique se as credenciais do usuário estão corretas no banco de dados
    const user = await mongoRepository.getUsers(email, password);

    if (user.length > 0) {
      // Usuário autenticado com sucesso, redirecione para a página de loja
      req.session.user = user[0]
      res.redirect('/loja');
    } else {
      // Credenciais inválidas, exiba um pop-up de erro usando JavaScript
      res.send('<script>alert("Credenciais inválidas"); window.location.href="/signin";</script>');
    }
  } catch (error) {
    // Trate qualquer erro que possa ocorrer ao acessar o banco de dados
    console.error(error);
    res.status(500).send('<script>alert("Erro ao autenticar o usuário"); window.location.href="/signin";</script>');
  }
});

app.get('/loja', async (req, res) => {
  //console.log('=== GET - /signup');
  const cars = await mongoRepository.getAllCars();
  res.render('client/loja', {cars});
});


app.get('/signup', (req, res) => {
  //console.log('=== GET - /signup');
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  //console.log('=== POST - /signup');
  const { email, password } = req.body;

  try {
    // Verifique se o email já está cadastrado no banco de dados
    const existingUser = await mongoRepository.getUserByEmail(email);

    if (existingUser) {
      // Email já está em uso, exiba uma mensagem de erro
      res.render('signup', { error: 'O email fornecido já está em uso' });
    } else {
      // Crie um novo usuário no banco de dados
      await mongoRepository.createUser(email, password);
      res.redirect('/signin');
    }
  } catch (error) {
    // Trate qualquer erro que possa ocorrer ao acessar o banco de dados
    console.error(error);
    res.render('error', { error: 'Erro ao cadastrar o usuário' });
  }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
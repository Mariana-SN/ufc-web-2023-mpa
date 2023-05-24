const express = require('express')
const cookieSession = require('cookie-session')
const nodemailer = require('nodemailer')
const app = express()
const port = 3000

//app.use(express.static('index'));
app.use(express.static(__dirname + '/public'));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs');
app.set('views', './views');

require('dotenv').config();

app.use(cookieSession({
  name: 'ufc-web-session',
  secret: 'c293x8b6234z82n938246bc2938x4zb234',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const mongoRepository = require('./repositorios/mongo-repository');

app.get('/logout', (req, res) => {
  req.session = null
  res.redirect('/')
})

app.get('/', async (req, res) => {
  //console.log('=== GET - /');
  const cars = await mongoRepository.getAllCars();
  res.render('home', { cars });

});

app.get('/signin', (req, res) => {
  //console.log('=== GET - /signin');
  res.render('signin', { error: null });
});


app.post('/signin', async (req, res) => {
  console.log('=== POST - /signin');
  const { email, password } = req.body;

  const user = await mongoRepository.getUsers(email, password);

  if (user.length > 0) {
    req.session.user = user[0]
    res.redirect('/loja');
  } else {
    res.send('<script>alert("Credenciais inválidas"); window.location.href="/signin";</script>');
  }
});


app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  const { name, birthDate, gender, phone, email, password, confirmPassword } = req.body;
  const existingUser = await mongoRepository.getUsers(email);

  if (existingUser.length > 0) {
    res.send('<script>alert("O email fornecido já está em uso"); window.location.href="/signup";</script>');
  }
  else {
    if (password !== confirmPassword) {
      res.send('<script>alert("As senhas não correspondem"); window.location.href="/signup";</script>');
    }
    else {
      await mongoRepository.addUser({ name, birthDate, gender, phone, email, password });

      const mailOptions = {
        from: 'seu-email',
        to: email,
        subject: 'Cadastro realizado com sucesso',
        text: `Olá ${name},\n\nSeu cadastro na Minha Loja de Carros foi realizado com sucesso!`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
        } else {
          console.log('Email enviado: ' + info.response);
        }
      });

      res.redirect('/signin');
    }
  }
});

app.get('/loja', async (req, res) => {
  //console.log('=== GET - /signup');
  const cars = await mongoRepository.getAllCars();
  res.render('client/loja', { cars });
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
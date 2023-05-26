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
  console.log('=== GET - /');
  res.render('home', { cars });

});

app.get('/signin', (req, res) => {
  //console.log('=== GET - /signin');
  res.render('signin', { error: null });
});


app.post('/signin', async (req, res) => {
  console.log('=== POST - /signin');
  const { email, password } = req.body;

  const user = await mongoRepository.getUsers(email);

  if (user.length === 0 || user[0].password !== password) {
    
    return res.send('<script>alert("Credenciais inválidas"); window.location.href="/signin";</script>');
  }

  req.session.user = user[0]
  res.redirect('/loja');
});


app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  const { name, birthDate, gender, phone, email, password, confirmPassword, role } = req.body;
  const existingUser = await mongoRepository.getUsers(email);

  if (existingUser.length > 0) {
    res.send('<script>alert("O email fornecido já está em uso"); window.location.href="/signup";</script>');
  }
  else {
    if (password !== confirmPassword) {
      res.send('<script>alert("As senhas não correspondem"); window.location.href="/signup";</script>');
    }
    else {
      await mongoRepository.addUser({ name, birthDate, gender, phone, email, password, role });

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

app.use('/loja', (req, res, next) => {
  console.log(req.session)
  console.log('passou aqui')
  if (req.session.user.role == 'client') {
    next()
  }
  else res.redirect('/')
})

app.get('/loja', async (req, res) => {
  //console.log('=== GET - /signup');
  const cars = await mongoRepository.getAllCars();
  res.render('client/loja', { cars });
});

app.get('/loja/conta', async (req, res) => {
  const userId = req.session.user._id;

  const user = await mongoRepository.getUserById(userId);
  
    if (user) {
      res.render('client/conta', { user });
    } else {
      console.log('passou aquiiii')

      res.redirect('/signin');
    }
 
});

app.get('/loja/conta-editar', (req, res) => {
  res.render('client/conta-editar', { user: req.session.user });
});

app.get('/loja/conta-senha', (req, res) => {
  res.render('client/conta-senha', { user: req.session.user });
});

app.post('/loja/conta-editar', async (req, res) => {
  const userId = req.session.user._id;
  const { name, birthDate, gender, phone, email } = req.body;

  await mongoRepository.updateUser(userId, { name, birthDate, gender, phone, email });

  const updateUser = await mongoRepository.getUserById(userId);

  req.session.user = updateUser;
  console.log( req.session.user);

  res.redirect('/loja/conta');
});

app.get('/loja/alterar-senha', (req, res) => {
  res.render('client/alterar-senha');
});

app.post('/loja/alterar-senha', async (req, res) => {
  const userId = req.session.user._id;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;
  const confirmPassword = req.body.confirmPassword;

  const user = await mongoRepository.getUserById(userId);

  if (user && user.password === oldPassword) {
    if (newPassword === confirmPassword) {
      await mongoRepository.updateUserPassword(userId, newPassword);
      res.redirect('/loja/conta');
    } else {
      res.send('<script>alert("As senhas não correspondem"); window.location.href="/loja/conta-senha";</script>');
    }
  } else {
    res.send('<script>alert("Senha incorreta"); window.location.href="/loja/conta-senha";</script>');
  }
});


app.get('/admin', (req, res) => {
  //console.log('=== GET - /signin');
  res.render('admin/signin');
});

app.post('/admin/signin', async (req, res) => {
  const { email, password } = req.body;

  const user = await mongoRepository.getUsers(email);

  if (user.length === 0 || user[0].password !== password) {
    
    return res.send('<script>alert("Credenciais inválidas"); window.location.href="/admin";</script>');
  }

  req.session.user = user[0]
  res.redirect('/admin/loja');
});

app.use('/admin/*', (req, res, next) => {
  //console.log(req.session)
  if (req.session.user.role == 'admin') {
    next()
  }
  else res.redirect('/')
})

app.get('/admin/loja', async (req, res) => {
  const cars = await mongoRepository.getAllCars();
  res.render('admin/loja', { cars });
});

// ROUTES ADMIN 

app.get('/admin/loja/add-carro', async (req, res) => {
  const cars = await mongoRepository.getAllCars();
  res.render('car/createCar', { cars });
});

app.get('/admin/aluguel', async (req, res) => {
  const cars = await mongoRepository.getAllCars();
  res.render('admin/aluguel', { cars });
});

app.get('/admin/update-car/:_id', async (req, res) => {
  const { _id } = req.params

  console.log(_id)
  const car = await mongoRepository.getCarById(_id);

  res.render('car/updateCar', { car: car });
});

app.post('/admin/loja/add-carro', async (req, res) => {
  const { photo, name, brand, color, price, daily } = req.body 

  const dataCreate = {
    photo, name, brand,  color, price, daily, available: true
  }

  await mongoRepository.addCar(dataCreate);

  res.redirect('/admin/loja')
});


app.get('/admin/loja/excluir-carro/:_id', async (req, res) => {
  const { _id } = req.params;

  await mongoRepository.deleteCar(_id);

  return res.send('<script>alert("Carro excluído com sucesso"); window.location.href="/admin/loja";</script>');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');

const isSignedIn = require('./middleware/is-signed-in.js');
const passUserToView = require('./middleware/pass-user-to-view.js');


const authController = require('./controllers/auth.js');
const coffeeShopsController = require('./controllers/coffeeShops.js');
const profilesController = require("./controllers/profiles.js");
const messagesController = require("./controllers/messages.js"); 
const reviewController = require('./controllers/reviews.js');
const listController = require('./controllers/lists.js');

const port = process.env.PORT ? process.env.PORT : '3000';

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB: ${mongoose.connection.name}.`);
});

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(express.static("static"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passUserToView);

app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/coffeeShops');
  } else {
    res.render('index.ejs');
  }
});

app.get('/home', (req, res) => {
  res.render('index.ejs');
});

app.use('/auth', authController);

app.use(isSignedIn);

app.use('/coffeeShops', coffeeShopsController);

app.use("/", profilesController);

app.use("/messages", messagesController);

app.use('/coffeeShops', reviewController);

app.use('/users', listController);

app.listen(port, () => {
  console.log(`Moka Meet express app running on port ${port}!`);
});
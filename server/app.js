'use strict';
const join = require('path').join;
const config = require('js-yaml')
  .safeLoad(
    require('fs')
    .readFileSync(join(__dirname, '../config.yaml')))
const log = require('logbro');
const express = require('express');
const App = express();
const hbs = require('hbs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const DB = require('./db');
const query = require('./utils/query');


hbs.registerPartials(join(__dirname, '../templates/partials'));
const recipeService = require('./recipe-service');

App.use(require('body-parser').json());
App.use(require('body-parser').urlencoded());
App.use(require('express-session')({secret : 'MY SECRET', resave : false, saveUnintialized : false}));
App.use(passport.initialize());
App.use(passport.session());

passport.use(new LocalStrategy(function(username, password, done){
  return query(DB, 'SELECT * FROM site_users WHERE username = ?', username)
  .then(results => {
    if(results.length === 0) return done(null, false, {message : 'Incorrect username'})
    if(bcrypt.compareSync(password, results[0].password) === false) {
      return done(null, false, {message : 'Incorrect Password'});
    }
    done(null, {id : results[0].id});
  })
  .catch(err => done(err));
}));

passport.serializeUser(function (user, done){
  console.log('serizalize')
  done(null, {id : user.id});
});

passport.deserializeUser(function(user, done){
  console.log('DE serizalize')
  return query(DB, 'SELECT * FROM site_users WHERE id = ?', user.id)
  .then(results => {
    return done(null, {id : results[0].id, username : results[0].username});
  })
  .catch(err => done(err));
})

App.set('views', join(__dirname, '../templates'));
App.set('view engine', 'hbs');
App.use(require('./routes'));
App.get('/', function(req, res){
  console.log(req.user);
  res.render('index');
});
App.get('/register', function(req, res) {
  res.render('register');
});
App.post('/login', passport.authenticate('local', {
  successRedirect : '/', 
  failureRedirect : '/login',
   failureFlash : true
 }));

App.post('/register', function(req, res, next){
  console.log(req.body);
  if(!req.body.username) return res.redirect('/register?invalidUsername=true');
  if(!req.body.password) return res.redirect('/register?invalidPassword=true');
  const hashedPassword = bcrypt.hashSync(req.body.password);
  return query(DB, 'INSERT INTO site_users SET username = ?, password = ?', 
  [req.body.username, hashedPassword])
  .then((results) => {
    console.log('LOGIN', results)
    req.login({id : results.insertId}, function(err){
      console.log(err, 'SOME ERROR');
      if(err) return next(err);
      return res.redirect('/');
    });
    console.log('after loginc call')
  });
});

App.get('/login', (req, res) => res.render('login'));

App.get('/recipe/:id', function(req,res){
  recipeService.getRecipeById(req.params.id)
  .then(recipe => {
    res.render('recipe', {recipe});
  })
  .catch(err => {
    log.error(err.stack);
    res.render('error');
  })
});

App.listen(config.PORT);
log.info(`Listening on ${config.PORT}`)
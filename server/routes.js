'use strict';
const log = require('logbro');
const Router = require('express').Router;
const Auth = require('./auth');

const recipeService = require('./recipe-service');

module.exports = function(passport){
  const router = Router();
  router.get('/', function(req, res) {
    console.log(req.session);
    res.render('index');
  });
  router.get('/register', function(req, res) {
    res.render('register');
  });
  router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }));

  router.get('/recipe/:id', function(req, res) {
    recipeService.getRecipeById(req.params.id)
      .then(recipe => {
        res.render('recipe', {
          recipe
        });
      })
      .catch(err => {
        log.error(err.stack);
        res.render('error');
      })
  });


  router.post('/register', function(req, res, next) {
    if (!req.body.username) return res.redirect('/register?invalidUsername=true');
    if (!req.body.password) return res.redirect('/register?invalidPassword=true');
    return Auth.registerUser(req.body.username, req.body.password)
    .then(userID => {
      req.login({
        id: userID
      }, function(err) {
        if (err) return next(err);
        return res.redirect('/');
      });
    })
    .catch(err => {
      res.redirect('/register?error=true');
      log.info(err.stack);
    })
  });

  router.get('/login', (req, res) => res.render('login'));

  router.get('/api/recipe/:id', function(req, res) {
    recipeService.getRecipeById(req.params.id)
      .then(recipe => {
        res.json({
          recipe
        });
      })
      .catch(err => {
        res.json({
          error: err.stack
        });
      });
  });

  router.put('/api/recipe/', function(req, res) {
    const url = req.body.recipeURL;
    return recipeService.addRecipe(url)
      .then(() => {
        res.json({
          ok: true
        });
      })
      .catch(err => {
        res.json({
          error: err.stack
        });
      });
  });
  return router;
}
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

hbs.registerPartials(join(__dirname, '../templates/partials'));
const recipeService = require('./recipe-service');

App.use(require('body-parser')
  .json());

App.set('views', join(__dirname, '../templates'));
App.set('view engine', 'hbs');
App.use(require('./routes'));
App.get('/', function(req, res){
  res.render('index');
});
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
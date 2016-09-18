'use strict';
const tape = require('tape');
const App = require('../server/app');
const supertest = require('supertest-as-promised');
const RecipeService = require('../server/recipe-service');
const join = require('path').join;
const nock = require('nock');

const basicRecipe = require('./data/mock-recipe.json');

tape('/api/recipe/:id', function(t){
  RecipeService.addRecipe(Object.assign({}, basicRecipe))
  .then(r => RecipeService.getRecipeById(r.id).then(rec => [rec, r.id]))
  .then(arr => {
    const getIdResponse = {recipe : arr[0]};
    const id = arr[1];
    supertest(App)
    .get(`/api/recipe/${id}`)
    .expect(200)
    .then(res => {
      t.deepLooseEqual(res.body, getIdResponse);
      t.end();
    })
    .catch(err => t.fail(err.stack));
  });
});

tape('/api/recipe/', function(t){
  const host = 'http://recipe.site';
  const sourceURL = '/recipe';
  nock(host)
  .get(sourceURL)
  .replyWithFile(200, join(__dirname, '/data/simple-recipe.html'));

  supertest(App)
  .put('/api/recipe')
  .send({sourceURL : host+sourceURL})
  .then(res => {
    t.equals(typeof res.body.id, 'number');
    t.end();
  })
  .catch(err => t.fail(err.stack));
});


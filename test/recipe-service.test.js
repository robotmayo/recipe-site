'use strict';
const test = require('tape');
const nock = require('nock');
require('dotenv').config();

const RecipeService = require('../server/recipe-service');

test.onFinish(function(){
  require('../server/db').end();
});

const basicRecipeJSON = {
  name : 'TestName',
  author : 'TestAuthor',
  instructions : ['Cut apples', 'Eat Apples'],
  ingredients : [
    {
      value : 1,
      measurement : 'cups',
      ingredient : 'apples',
      raw : '1 cups apples'
    }
  ],
  sourceURL : ''
};

function testRecipe(inputRecipe, t, outRecipeWithId){
  t.pass('Succeed in adding recipe');
    return RecipeService.getRecipeById(outRecipeWithId.id)
    .then(recipe => {
      t.equal(recipe.name, inputRecipe.name);
      t.equal(recipe.sourceURL, inputRecipe.sourceURL);
      recipe.ingredients.forEach((i, ind) => {
        t.equal(i, inputRecipe.ingredients[ind].raw);
      });
      recipe.instructions.forEach((i, ind) => {
        t.equal(i, inputRecipe.instructions[ind]);
      });
      t.end();
    });
}

test.only('addRecipe', function(t){
  const recCopy = Object.assign({}, basicRecipeJSON);
  RecipeService.addRecipe(recCopy)
  .then(testRecipe.bind(null, recCopy, t))
  .catch(err => {
    t.fail(err.stack);
  });
});

test('importRecipeFromUrl', function(t){
  const host = 'http://recipe.site';
  const sourceURL = '/recipe';
  const recCopy = Object.assign(
    {}, 
    basicRecipeJSON,
    {sourceURL : host + sourceURL}
  );
  const join = require('path').join;
  nock(host)
  .get(sourceURL)
  .replyWithFile(200, join(__dirname, '/data/basic-recipe.html'));

  RecipeService.importRecipeFromUrl(host+sourceURL)
  .then(testRecipe.bind(null, recCopy, t))
  .catch(err => t.fail(err.stack));

});

  
test('getRecipeDataFromURL', function(t){
  const host = 'http://recipe.site';
  const sourceURL = '/recipe';
  const join = require('path').join;
  nock(host)
  .get(sourceURL)
  .replyWithFile(200, join(__dirname, '/data/simple-recipe.html'));

  RecipeService.getRecipeDataFromURL(host+sourceURL)
  .then(r => {
    t.equal(r.sourceURL, host + sourceURL);
    t.end();
  })
  .catch(err => {
    t.fail(err.stack);
  });
});

test('getRecipeById', function(t){
  const recCopy = Object.assign({}, basicRecipeJSON);
  RecipeService.addRecipe(recCopy)
  .then(recipe => {
    return RecipeService.getRecipeById(recipe.id)
    .then(rec => {
      const expected = {
        name : recCopy.name,
        author : recCopy.author,
        sourceURL : recCopy.sourceURL,
        ingredients : recCopy.ingredients[0].raw,
        instructions : recCopy.instructions
      };
      t.deepLooseEqual(rec, expected);
    });
  })
  .catch(err => t.fail(err.stack));
});
'use strict';
const test = require('tape');
require('dotenv').config();

const RecipeService = require('../server/recipe-service');


test('addRecipe', function(t){
  const inputRecipe = {
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
    ]
  };
  
  RecipeService.addRecipe(inputRecipe)
  .then(r => {
    t.pass('Succeed in adding recipe');
    return RecipeService.getRecipeById(r.id)
    .then(recipe => {
      t.equal(recipe.name, inputRecipe.name);
      t.equal(recipe.sourceURL, '', 'Source URL should be empty');
      recipe.ingredients.forEach((i, ind) => {
        t.equal(i, inputRecipe.ingredients[ind].raw);
      });
      recipe.instructions.forEach((i, ind) => {
        t.equal(i, inputRecipe.instructions[ind]);
      });
      t.end();
    });
  })
  .catch(err => {
    t.fail(err.stack);
  });

});
'use strict';
const fetch = require('node-fetch');

const query = require('./utils/query');
const DB = require('./db');
const scraper = require('./recipe-scraper');
const MD5 = require('./utils/md5');

const GET_RECIPE_BY_ID = `
  SELECT * FROM recipe AS r
  JOIN recipe_ingredients AS ri
  ON ri.recipe_id = r.id
  JOIN recipe_instructions AS rt
  ON rt.recipe_id = r.id
  WHERE r.id = ?
  `;

const INSERT_RECIPE_QUERY = `INSERT INTO recipe (name, url_hash, source_url)
VALUES (?)`;
const INSERT_INGREDIENT_QUERY = `
INSERT INTO recipe_ingredients 
(amount, measurement, recipe_id, ingredient_text)
VALUES ?
`;
const INSERT_INSTRUCTION_QUERY = `
INSERT INTO recipe_instructions
(recipe_id, instruction)
VALUES (?)
`;

function getRecipeById(id) {
  return query(DB, GET_RECIPE_BY_ID, id)
  .then(recipe => {
    return {
      name : recipe[0].name,
      sourceURL : recipe.sourceURL,
      ingredients : recipe.map(i => i.ingredient_text),
      instructions : recipe.map(i => i.instruction)
    };
  })
}
module.exports.getRecipeById = getRecipeById;

function addRecipe(url) {
  return getRecipeDataFromURL(url)
    .then(insertRecipe)
    .then(insertIngredients)
    .then(insertInstructions);
}
module.exports.addRecipe = addRecipe;

function getRecipeDataFromURL(url) {
  return fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT x.y; Win64; x64; rv:10.0) Gecko/20100101 Firefox/10.0'
      }
    })
    .then(res => {
      if (!res.ok) return Promise.reject(new Error(res.statusText));
      return res.text();
    })
    .then(scraper.scrape)
    .then(recipe => Object.assign({
      url
    }, recipe));
}

function insertRecipe(recipe) {
  const recipeInsertData = [
    recipe.name,
    MD5(recipe.name + recipe.url),
    recipe.url
  ];
  return query(DB, INSERT_RECIPE_QUERY, [recipeInsertData])
    .then(results => {
      // TODO: Handle non inserts
      return Object.assign(recipe, {
        id: results.insertId
      });
    });
}
module.exports.insertRecipe = insertRecipe;

function insertIngredients(recipe) {
  const parsedRecipeIngredients = recipe.ingredients.map(i => {
    return [
      i.amount,
      i.measurement,
      recipe.id,
      i.raw
    ];
  });
  return query(DB, INSERT_INGREDIENT_QUERY, [parsedRecipeIngredients])
    .then(() => {
      //TODO: Handle results
      return recipe;
    });
}
module.exports.insertIngredients = insertIngredients;

function insertInstructions(recipe) {
  const recipeInstructions =
    recipe.instructions.map(i => {
      return [recipe.id, i];
    });
  return query(DB, INSERT_INSTRUCTION_QUERY, recipeInstructions)
    .then(() => recipe);
}
module.exports.insertInstructions = insertInstructions;
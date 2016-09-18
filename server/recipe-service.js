'use strict';
const fetch = require('node-fetch');

const DB = require('./db');
const query = require('./utils/query').bind(null, DB);
const scraper = require('./recipe-scraper');
const MD5 = require('./utils/md5');

const GET_RECIPE_AND_INGREDIENTS_BY_ID = `
  SELECT * FROM recipe AS r
  JOIN recipe_ingredients AS ri
  ON ri.recipe_id = r.id
  WHERE r.id = ?
  `;

const GET_RECIPE_INSTRUCTIONS = `
  SELECT * FROM recipe_instructions
  WHERE recipe_id = ?;
`;

const INSERT_RECIPE_QUERY = `INSERT INTO recipe (name, author, url_hash, source_url)
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
  return Promise.all(
    [
      query(GET_RECIPE_AND_INGREDIENTS_BY_ID, id),
      query(GET_RECIPE_INSTRUCTIONS, id)
    ]
  )
  .then(results => {
    if(results[0].length === 0) return Promise.reject(new Error('Recipe not found'));
    const recipeAndIngredients = results[0];
    const instructions = results[1];
    return {
      name : recipeAndIngredients[0].name,
      author : recipeAndIngredients[0].author,
      sourceURL : recipeAndIngredients[0].source_url,
      ingredients : recipeAndIngredients.map(i => i.ingredient_text),
      instructions : instructions.map(i => i.instruction)
    };
  });
}
module.exports.getRecipeById = getRecipeById;

function importRecipeFromUrl(sourceURL) {
  return getRecipeDataFromURL(sourceURL)
    .then(insertRecipe)
    .then(insertIngredients)
    .then(insertInstructions);
}
module.exports.importRecipeFromUrl = importRecipeFromUrl;


/**
 * 
 * Add recipe to database
 * @param {StandardRecipe} standardRecipe
 * @returns {StandardRecipe} original Returns the original input recipe
 * @returns {StandardRecipe.id} Id of the recipe in the database
 */
function addRecipe(standardRecipe){
  return insertRecipe(standardRecipe)
  .then(insertIngredients)
  .then(insertInstructions);
}
module.exports.addRecipe = addRecipe;

/**
 * 
 * @param {string} sourceURL
 * @returns {StandardRecipe}
 */
function getRecipeDataFromURL(sourceURL) {
  return fetch(sourceURL, {
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
      sourceURL
    }, recipe));
}
module.exports.getRecipeDataFromURL = getRecipeDataFromURL;

function insertRecipe(recipe) {
  const recipeInsertData = [
    recipe.name,
    recipe.author,
    MD5(recipe.name + recipe.sourceURL),
    recipe.sourceURL || ''
  ];
  return query(INSERT_RECIPE_QUERY, [recipeInsertData])
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
  return query(INSERT_INGREDIENT_QUERY, [parsedRecipeIngredients])
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
  return query(INSERT_INSTRUCTION_QUERY, recipeInstructions)
    .then(() => recipe);
}
module.exports.insertInstructions = insertInstructions;
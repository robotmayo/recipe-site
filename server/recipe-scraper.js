'use strict';
/**
 * @typedef {object} cheerio
 */
const cheerio = require('cheerio');

/**
 * 
 * 
 * @typedef {object} StandardRecipe
 * @property {string} name Recipe name
 * @property {string} author Recipe author
 * @property {parsed[]} ingredients Array of parsed ingredients
 * @property {string[]} instructions Array of instructions
 * @property {string=""} [sourceURL]
 */


/**
 * 
 * Scrape the html for a recipe
 * @param {string} html
 * @returns {StandardRecipe}
 */
function scrape(html) {
  const $ = cheerio.load(html);
  const recipesSchema = getRecipeSchemas($);
  const recipeName = getItemProp($, 'name', recipesSchema)
    .text();
  const author = getItemProp($, 'author', recipesSchema)
    .text();
  const $instructions = getItemProp($, 'recipeInstructions', recipesSchema);
  const instructions = [];
  $instructions.map((idx, $i) => instructions.push($($i)
    .text()));

  const $ingredients = getItemProp($, 'ingredients', recipesSchema);
  const ingredients = parseIngredients($, $ingredients);

  return {
    name: recipeName,
    author,
    ingredients,
    instructions
  };
}
module.exports.scrape = scrape;

/**
 * 
 * 
 * @param {cheerio} $ Cheerio Object
 * @param {cheerio} $ingredients Cherio object of ingredients see https://schema.org/recipeIngredient
 * @returns {parsed[]}
 */
function parseIngredients($, $ingredients) {
  const parsedIngredients = [];
  $ingredients
    .map((ind, $i) => {
      const ingredientText = $($i)
        .text();
      const parsedIngredient = parseIngredientText(ingredientText);
      parsedIngredients.push(parsedIngredient);
      return true;
    });
  return parsedIngredients;
}
module.exports.parseIngredients = parseIngredients;

/**
 * 
 * 
 * @typedef {Object} parsed
 * @property {number} parsed.value How much of the ingredient. Used with measurement EG (2 Cups)
 * @property {string} parsed.measurement The measurement of the ingredient EG (cup)
 * @property {string} parsed.ingredient The name of the ingredient
 * @property {string} parsed.raw The raw value
 */

/**
 * 
 * Parse the provided text extracting out ingredients
 * @param {string} text 
 * @returns {parsed}
 */
function parseIngredientText(text) {
  const tokens = text.replace(/\s+/g, ' ')
    .split(' ');
  let seenValue = false;
  let seenMeasurement = false;
  const parsed = {
    value: 0,
    measurement: '',
    ingredient: '',
    raw: text
  };
  // 1/3 Cup Milk
  // 1.5 grams ketchup
  for (const token of tokens) {
    if (token === ' ' || token === '(') continue;
    if (!seenValue) {
      let v = parseFloat(token);
      if (isNaN(v) === true) {
        throw new Error('This is BADDDD!!');
      }
      parsed.value = v;
      seenValue = true;
      continue;
    }
    if (seenValue && !seenMeasurement) {
      parsed.measurement = token;
      seenMeasurement = true;
      continue;
    }
    parsed.ingredient += token + ' ';
  }
  return parsed;
}

module.exports.parseIngredientText = parseIngredientText;


/**
 * 
 * 
 * @param {cheerio} $
 * @param {string} property
 * @param {cheerio} context
 * @returns {cheerio} property Returns the property as a cheerio object
 */
function getItemProp($, property, context) {
  return $(`[itemprop=${property}]`, context);
}
module.exports.getItemProp = getItemProp;


/**
 * 
 * 
 * @param {cheerio} $
 * @returns {cheerio} recipeData Single cheerio object containing recipe html data
 */
function getRecipeSchemas($) {
  return $('[itemtype="http://schema.org/Recipe"]')
    .eq(0);
}
module.exports.getRecipeSchemas = getRecipeSchemas;
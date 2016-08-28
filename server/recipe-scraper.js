'use strict';

const fetch = require('node-fetch');
const cheerio = require('cheerio');

function scrape(html) {
  const $ = cheerio.load(html);
  const recipesSchema = getRecipeSchemas($);
  const recipes = [];
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
  }
}
module.exports.scrape = scrape;

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

function getItemProp($, property, context) {
  return $(`[itemprop=${property}]`, context);
}
module.exports.getItemProp = getItemProp;

function getRecipeSchemas($) {
  return $('[itemtype="http://schema.org/Recipe"]')
    .eq(0);
}
module.exports.getRecipeSchemas = getRecipeSchemas;
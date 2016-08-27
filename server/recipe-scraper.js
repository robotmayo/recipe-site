'use strict';

const fetch = require('node-fetch');
const cheerio = require('cheerio');


function scrape(html){
  const $ = cheerio.load(html);
  const recipesSchemas = getRecipeSchemas($);
  const recipes = [];
  recipesSchemas.map(rs => {
    const recipeName  = getItemProp($, 'name').text();
    const author = getItemProp($, 'author').text();
    const $instructions = getItemProp($, 'recipeInstructions');
    const instructions = [];
    $instructions.map((idx, $i) => instructions.push($($i).text()));
    
    const $ingredients = getItemProp($, 'ingredients');
    const ingredients = parseIngredients($, $ingredients);

    recipes.push({
      name : recipeName,
      author,
      ingredients,
      instructions
    });
    return true;
  });
  return recipes;
} 
module.exports.scrape = scrape;

function parseIngredients($, $ingredients){
  const parsedIngredients = [];
  $ingredients
  .map((ind, $i) => {
    const ingredientText = $($i).text();
    const parsedIngredient = parseIngredientText(ingredientText);
    parsedIngredients.push(parsedIngredient);
    return true;
  });
  return parsedIngredients;
}
module.exports.parseIngredients = parseIngredients;

function parseIngredientText(text){
  const tokens = text.replace(/\s+/g, ' ').split(' ');
  let seenValue = false;
  let seenMeasurement = false;
  const parsed = {
    value : 0,
    measurement : '',
    ingredient : '',
    raw : text
  };
  // 1/3 Cup Milk
  // 1.5 grams ketchup
  for(const token of tokens){
    if(token === ' ' || token === '(') continue;
    if(!seenValue){
      let v = parseFloat(token);
      if(isNaN(v) === true) {
        throw new Error('This is BADDDD!!');
      }
      parsed.value = v;
      seenValue = true;
      continue;
    }
    if(seenValue && !seenMeasurement){
      parsed.measurement = token;
      seenMeasurement = true;
      continue;
    }
    parsed.ingredient += token + ' ';
  }
  return parsed;
}

module.exports.parseIngredientText = parseIngredientText;

function getItemProp($, property){
  return $(`[itemprop=${property}]`);
}
module.exports.getItemProp = getItemProp;

function getRecipeSchemas($){
  return $('[itemtype="http://schema.org/Recipe"]');
}
module.exports.getRecipeSchemas = getRecipeSchemas;




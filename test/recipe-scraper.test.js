'use strict';
const test = require('tape');
const fs = require('fs');
const scrape = require('../server/recipe-scraper.js');
const cheerio = require('cheerio');
const join = require('path').join;

test('getRecipeSchemas', function(t){
  t.plan(2);
  const simpleHTML = fs
  .readFileSync(join(__dirname, './data/simple-recipe.html'), 'utf-8');
  const $1 = cheerio.load(simpleHTML);
  const schemas = scrape.getRecipeSchemas($1);
  t.equals(schemas.length, 1, 'Sample site should only have one schema');
  
  const multiRecipe = fs
  .readFileSync(join(__dirname, './data/multiple-recipe.html'), 'utf-8');
  
  const $2 = cheerio.load(multiRecipe);
  const schemas2 = scrape.getRecipeSchemas($2);
  t.equals(schemas2.length, 3, 'Multi site should only three schemas');
});

test('scraper', function(t){
  const simpleHTML = fs
  .readFileSync(join(__dirname, './data/simple-recipe.html'), 'utf-8');
  const simpleRecipes = scrape.scrape(simpleHTML);
  t.equals(simpleRecipes.length, 1, 'Should return a single recipe');
  const simpleRecipe = simpleRecipes[0];
  console.log(simpleRecipe)
  t.equals(simpleRecipe.name, 'Quick Homemade Ketchup');
  t.equals(simpleRecipe.author, 'Mommypotamus');
  t.end();
});

test('parseIngredientText', function(t){
  const simpleHTML = fs
  .readFileSync(join(__dirname, './data/simple-recipe.html'), 'utf-8');
  const $ = cheerio.load(simpleHTML);
  const $ingredients = scrape.getItemProp($, 'ingredients');
  const firstIngredient = $ingredients.eq(0).text();
  const parsedIngredient = scrape.parseIngredientText(firstIngredient);
  parsedIngredient.ingredient = parsedIngredient.ingredient.trim();
  t.deepEqual(parsedIngredient, {
    value : 12,
    measurement : 'ounces',
    ingredient : 'ketchup'
  })
  t.end();
});



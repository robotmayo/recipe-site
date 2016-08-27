'use strict';

const express = require('express');
const App = express();
const mysql = require('mysql');
const fetch = require('node-fetch');
const scraper = require('./recipe-scraper');
const crypto = require('crypto');
function MD5(txt){
  const m = crypto.createHash('md5');
  m.update(txt);
  return m.digest('hex');
}
const pool =  mysql.createPool({
  user : 'root',
  password : 'root',
  host : 'localhost',
  database : 'recipe_site',
  port : ''
});

function Query(conn, query, data){
  return new Promise(function(resolve, reject){
    console.log(mysql.format(query, data))
    conn.query(query, data, (err, results) => {
      if(err) return reject(err);
      return resolve(results);
    })
  });
}

const router = express.Router();

router.get('/api/recipe/:id', function(req, res){
  return Query(pool, `
    SELECT * FROM recipe AS r
    JOIN recipe_ingredients AS ri
    ON ri.recipe_id = r.id
    JOIN recipe_instructions AS rt
    ON rt.recipe_id = r.id
    WHERE r.id = ?
    `,  req.params.id)
  .then(results => res.json(results))
  .catch(err => {
    console.error(err)
    res.json({err : err.stack});
  })
});

router.put('/api/recipe/', function(req, res){
  const url = req.body.url;
  fetch(url, {headers : {'User-Agent' : 'Mozilla/5.0 (Windows NT x.y; Win64; x64; rv:10.0) Gecko/20100101 Firefox/10.0'}})
  .then(res => {
    if(!res.ok) return Promise.reject(new Error(res.statusText));
    return res.text();
  })
  .then(scraper.scrape)
  .then(recipes => {
    const recipe = recipes[0];
    const recipeInsertData = 
      [
        recipe.name,
        MD5(recipe.name + url),
        url
      ];
    const recipeInstructions = [];
    
    
    return Query(pool,
      `
      INSERT INTO recipe (name, url_hash, source_url)
      VALUES (?)
      `,
      [recipeInsertData]
    )
    .then(results => {
      // TODO: Handle non inserts
      return results.insertId;
    })
    .then(recipeId => {
      const parsedRecipeIngredients = recipe.ingredients.map(i => {
        return [
          i.amount,
          i.measurement,
          recipeId,
          i.raw
        ];
      })
      console.log(parsedRecipeIngredients);
      
      return Query(pool,
      `
        INSERT INTO recipe_ingredients 
          (amount, measurement, recipe_id, ingredient_text)
          VALUES ?
      `,
      [parsedRecipeIngredients]
      )
      .then(() => {
        //TODO: Handle results
        return recipeId;
      });
    })
    .then(recipeId => {
      const recipeInstructions = 
      recipe.instructions.map(i => {
        return [recipeId, i];
      })
      return Query(pool, 
        `
          INSERT INTO recipe_instructions
            (recipe_id, instruction)
            VALUES (?)
        `, recipeInstructions)
    })
    .then(() => {
      //TODO Handle results
      res.json({message : 'WE FUCKING DID IT'});
    })
    .catch(err => {
      console.error(err);
      res.json({err : err.stack});
    })
  })
  .catch(err => {
    console.error(err);
    res.json({err : err.stack});
  })
});

App.use(require('body-parser').json());
App.use(router);
App.listen(8080);

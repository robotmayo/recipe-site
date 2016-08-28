'use strict';
const log = require('logbro');
const router = require('express').Router();

const recipeService = require('./recipe-service');

router.get('/api/recipe/:id', function(req, res) {
  recipeService.getRecipeById(req.params.id)
    .then(recipe => {
      res.json({
        recipe
      });
    })
    .catch(err => {
      console.log(err.stack);
      res.json({
        error: err.stack
      });
    });
});

router.put('/api/recipe/', function(req, res) {
  const url = req.body.recipeURL;
  console.log(url)
  return recipeService.addRecipe(url)
  .then(() => {
    res.json({ok : true});
  })
  .catch(err => {
    console.log(err.stack);
    res.json({error : err.stack});
  });
});

module.exports = router;
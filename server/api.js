const Router = require('express').Router;
const recipeService = require('./recipe-service');

module.exports = function(){
  const router = Router();
  router.get('/api/recipe/:id', function(req, res) {
    recipeService.getRecipeById(req.params.id)
      .then(recipe => {
        res.json({
          recipe
        });
      })
      .catch(err => {
        res.json({
          error: err.stack
        });
      });
  });

  router.put('/api/recipe/', function(req, res) {
    const sourceURL = req.body.sourceURL;
    return recipeService.importRecipeFromUrl(sourceURL)
      .then(rec => {
        res.json({
          id : rec.id
        });
      })
      .catch(err => {
        res.json({
          error: err.stack
        });
      });
  });
  return router;
};
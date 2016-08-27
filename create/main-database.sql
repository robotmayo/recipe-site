DROP TABLE IF EXISTS recipe;
CREATE TABLE recipe(
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(300),
  url_hash CHAR(32),
  source_url VARCHAR(600),
  UNIQUE KEY `url_hash`(`url_hash`)
);

DROP TABLE IF EXISTS ingredients;
CREATE TABLE ingredients(
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100)
);

DROP TABLE IF EXISTS recipe_ingredients;
CREATE TABLE recipe_ingredients(
  id INT PRIMARY KEY AUTO_INCREMENT,
  amount DOUBLE,
  measurement VARCHAR(64),
  recipe_id INT,
  ingredient_id INT,
  ingredient_text VARCHAR(128)
);

DROP TABLE IF EXISTS recipe_instructions;
CREATE TABLE recipe_instructions(
  id INT PRIMARY KEY AUTO_INCREMENT,
  instruction TEXT,
  recipe_id INT
);

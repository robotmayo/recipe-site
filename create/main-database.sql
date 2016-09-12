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

DROP TABLE IF EXISTS site_users;
CREATE TABLE site_users(
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(30),
  password VARCHAR(100),
  UNIQUE KEY `username`(`username`)
);

DROP TABLE IF EXISTS sessions;
CREATE TABLE sessions(
  session_id VARCHAR(100),
  expires DATETIME NOT NULL,
  user_id INT NOT NULL
);




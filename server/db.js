const mysql = require('mysql');
const pool = mysql.createPool({
  user : process.env.RECS_DB_USER,
  password : process.env.RECS_DB_PASSWORD,
  host : process.env.RECS_DB_HOST,
  port : process.env.RECS_DB_PORT,
  database : process.env.RECS_DB_DATABASE
});
module.exports = pool;
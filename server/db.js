const mysql = require('mysql');
const config = require('js-yaml')
  .safeLoad(
    require('fs')
    .readFileSync(require('path')
      .join(__dirname, '../config.yaml')))
const pool = mysql.createPool(config.database);
module.exports = pool;
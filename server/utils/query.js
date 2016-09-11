'use strict';
const trace = require('logbro').trace;
const fmt = require('mysql').format;
function Query(conn, query, data){
  trace(fmt(query, data));
  return new Promise(function(resolve, reject){
    conn.query(query, data, (err, results) => {
      if(err) return reject(err);
      return resolve(results);
    })
  });
}
module.exports = Query;
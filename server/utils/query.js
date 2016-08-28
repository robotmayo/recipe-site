'use strict';
function Query(conn, query, data){
  return new Promise(function(resolve, reject){
    conn.query(query, data, (err, results) => {
      if(err) return reject(err);
      return resolve(results);
    })
  });
}
module.exports = Query;
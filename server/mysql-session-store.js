const log = require('logbro');
const inherits = require('util').inherits;

module.exports = 
function (session){
  const Store = session.Store;
  function MySQLSessionStore(opts){
    Store.call(this, opts);
    this.query = opts.query;
  }
  inherits(MySQLSessionStore, Store);

  MySQLSessionStore.prototype.destroy = function(sid, cb){
    this.query('DELETE FROM sessions WHERE session_id = sid')
    .then(() => cb(null))
    .catch(cb);
  }

  MySQLSessionStore.prototype.get = function(sid, cb){
    log.info('GET SESSION ', sid);
    this.query('SELECT expires, user_id FROM sessions WHERE session_id = ?', sid)
    .then(results => {
      log.info('SESSION RESULTS', results);
      if(results.length === 0) return cb(null, null);
      cb(null, results[0]);
    })
    .catch(cb);
  }

  MySQLSessionStore.prototype.set = function(sid, session, cb){
    log.trace('SET SESSION', sid, session);
    this.query(
      `INSERT INTO sessions SET session_id = ?, user_id = ?, 
      expires = DATE_ADD(NOW(), INTERVAL 30 DAY)`,
      [sid, session.passport.user.id]
    ).then(() => cb(null))
    .catch(cb);
  }
  return MySQLSessionStore;
}
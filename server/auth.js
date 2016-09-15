const bcrypt = require('bcryptjs');
const log = require('logbro');

const DB = require('./db');
const query = require('./utils/query')
  .bind(null, DB);
  
module.exports.SECRET = 'DJ KHALED';


function localStrategyHandler(username, password, done) {
  return query('SELECT * FROM site_users WHERE username = ?', username)
    .then(results => {
      if (results.length === 0) return done(null, false, {
        message: 'Incorrect username'
      })
      if (bcrypt.compareSync(password, results[0].password) === false) {
        return done(null, false, {
          message: 'Incorrect Password'
        });
      }
      done(null, {
        id: results[0].id
      });
    })
    .catch(err => done(err));
}
module.exports.localStrategyHandler = localStrategyHandler;

function serializeUser(user, done) {
  done(null, {
    id: user.id
  });
}
module.exports.serializeUser = serializeUser;

function deserializeUser(user, done) {
  log.debug('Am I being logged');
  return query('SELECT * FROM site_users WHERE id = ?', user.id)
    .then(results => {
      return done(null, {
        id: results[0].id,
        username: results[0].username
      });
    })
    .catch(err => done(err));
}
module.exports.deserializeUser = deserializeUser;

module.exports.registerUser = 
function registerUser(username, password) {
  const hashedPassword = bcrypt.hashSync(password);
  return query(
      'INSERT INTO site_users SET username = ?, password = ?',
      [username, hashedPassword]
    )
    .then(results => results.insertId);
}

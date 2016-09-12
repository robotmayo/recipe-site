'use strict';
const join = require('path').join;
const readFileSync = require('fs').readFileSync;
const safeLoad = require('js-yaml').safeLoad;
const log = require('logbro');
const express = require('express');
const hbs = require('hbs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const expressSession = require('express-session');

const Auth = require('./auth');
const App = express();
const config = safeLoad(readFileSync(join(__dirname, '../config.yaml')));
const MySQLStore = require('./mysql-session-store')(expressSession);

hbs.registerPartials(join(__dirname, '../templates/partials'));

App.use(require('body-parser').json());
App.use(require('body-parser').urlencoded());
App.use(expressSession({
  secret : Auth.SECRET, 
  resave : false, 
  saveUninitialized : false,
  store : new MySQLStore({
    query : require('./utils/query').bind(null, require('./db'))
  })
}))
App.use(passport.initialize());
App.use(passport.session());

passport.use(new LocalStrategy(Auth.localStrategyHandler));
passport.serializeUser(Auth.serializeUser);
passport.deserializeUser(Auth.deserializeUser);

App.set('views', join(__dirname, '../templates'));
App.set('view engine', 'hbs');
App.use(require('./routes')(passport));

App.listen(config.PORT);
log.info(`Listening on ${config.PORT}`)
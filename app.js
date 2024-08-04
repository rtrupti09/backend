const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const jwt = require('jsonwebtoken');
const cors = require('cors')
require('./util/functions');
require('./util/constants');
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const options = {};

const pgp = require('pg-promise')(options);
const connectionString = 'postgres://postgres:postgres@localhost:5432/bank_app_db';
global.db = pgp(connectionString)

const index = require('./routes/index');
const transaction = require('./routes/transaction');
const user = require('./routes/user');

app.use(cors());
const authChecker = function (req, res, next) {
  console.log(req.path);
  if (req.path == "/authenticate" || req.path == "/user/create_user"
  ) {
    next();
  } else {
    //validate token before entering routes
    const token = req.headers['x_access_token'];
    // decode token
    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, JWT_SECRET, function (err, decoded) {
        if (err) {
          console.log(err);
          res.status(401).json({ success: false, msg: 'Failed to authenticate token.' });
        } else {
          req.decoded = decoded;
          next();
        }
      });

    } else {
      res.status(401).send({
        success: false,
        msg: 'No token provided.'
      });

    }
  }
}

app.use(authChecker);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/transaction', transaction);
app.use('/user', user);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

console.log(encrypt('123'))
// error handler
app.use(function (err, req, res, next) {
  console.log(err)
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

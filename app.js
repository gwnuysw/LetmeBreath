var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');
var passport = require('passport');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var pinedustRouter = require('./routes/finedust');
var updateRouter = require('./routes/update');
var staticRouter = require('./routes/statistics')
var askdust = require('./bin/pinedust');
var app = express();

const passportConfig = require('./passport');
//몽고 데이터베이스 접속 mongodb connect
const connect = require('./schemas');
passportConfig(passport);
connect();

//running background
setInterval(askdust, 60*60*1000);
//askdust();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('letmebreath'));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'letmebreath',
  cookie: {
    httpOnly: true,
    secure: false
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/finedust',pinedustRouter);
app.use('/update',updateRouter);
app.use('/statistics', staticRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

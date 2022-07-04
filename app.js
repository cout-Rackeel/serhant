const port = process.env.PORT || 8083;

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var flash =  require('express-flash');
var session = require('express-session');
var expressLayout = require('express-ejs-layouts');

var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var employeesRouter = require('./routes/employees');
var salariesRouter = require('./routes/salaries');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//layout setup
app.set('layout','layouts/layout');
app.use(expressLayout);

app.use(logger('dev'));

// Body parser setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sessions Setup
app.use(cookieParser());
app.use(session({
  secret:'t8oshgf8Shj82W|#',
  saveUninitialized: false,
  resave:true,
  cookie:{maxAge:3000000}
}))
app.use(flash());

// Setup Public
app.use(express.static(path.join(__dirname, 'public')));


// Routing middleware setup 
app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/employees', employeesRouter);
app.use('/salaries', salariesRouter);


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


app.listen(port , () =>{console.log(`Listening on port ${port}....`);})

module.exports = app;

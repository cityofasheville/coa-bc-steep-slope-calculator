var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');

var routes = require('./routes/index');
var api = require('./routes/api');
var cors = require('cors');
var findslopeforparcel = require('./routes/findslopeforparcel');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

var allowList = [
  'https://simplicity.ashevillenc.gov', 
  'http://simplicity.ashevillenc.gov', 
  'https://dev-simplicity.ashevillenc.gov', 
  'http://dev-simplicity.ashevillenc.gov', 
  'https://localhost:3000', 
  'http://localhost:3000',
  'https://climatej.d1thp43hcib1lz.amplifyapp.com'
];
var corsOptions = {
  origin: function (origin, callback) {
    if (allowList.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
};

app.use(cors(corsOptions));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res,next) {
  res.locals.client = app.get('client');
  next();
});

app.use('/', routes);
app.use('/api', api);
app.use('/find-slope-for-parcel', findslopeforparcel);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;

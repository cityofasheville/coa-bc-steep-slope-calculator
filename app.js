var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const health = require('@cloudnative/health-connect')
const pg = require('pg')

let healthCheck = new health.HealthChecker();
var routes = require('./routes/index');
var api = require('./routes/api');
var findslopeforparcel = require('./routes/findslopeforparcel');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const livePromise = () => new Promise(function (resolve, _reject) {
  setTimeout(function () {
    pg.connect
    resolve();
  }, 10);
});
let liveCheck = new health.LivenessCheck("liveCheck", livePromise);
healthcheck.registerLivenessCheck(liveCheck);

app.use('/health', health.HealthEndpoint(healthCheck))
app.use('/live', health.HealthEndpoint(healthCheck))

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

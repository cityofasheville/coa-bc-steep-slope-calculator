import express, { json, urlencoded, static as servestatic } from 'express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import { URL } from 'url';
import routes from './routes/index.js';
import api from './routes/api.js';
import cors from 'cors';
import findslopeforparcel from './routes/findslopeforparcel.js';

var app = express();

// view engine setup
app.set('views', new URL('./views/', import.meta.url).pathname); // join(__dirname, 'views'));
app.set('view engine', 'hbs');

var allowList = [
  'https://simplicity.ashevillenc.gov',
  'http://simplicity.ashevillenc.gov',
  'https://dev-simplicity.ashevillenc.gov',
  'http://dev-simplicity.ashevillenc.gov',
  'https://steep-slope-dev.ashevillenc.gov',
  'https://localhost:3000',
  'http://localhost:3000',
  'https://climatej.d1thp43hcib1lz.amplifyapp.com',
  'https://steep-slope-dev.ashevillenc.gov/',
];
var corsOptions = {
  origin: function (origin, callback) {
    if (allowList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));

app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
const pubdir = new URL('./public/', import.meta.url).pathname;
app.use(servestatic(pubdir));

app.use(function (req, res, next) {
  res.locals.client = app.get('client'); // db client
  next();
});

app.use('/', routes);
app.use('/api', api);
app.use('/find-slope-for-parcel', findslopeforparcel);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});

export default app;

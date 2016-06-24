var _ = require('lodash');
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('api', {});
});


router.get('/slope', function(req, res, next) {
  res.render('slope');
});

router.get('/slope/:pin', function(req, res, next) {
  res.json({
    "maxElevation": "2160.00",
    "percentSlope": "20.32"
  })
});

module.exports = router;

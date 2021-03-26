var _ = require('lodash');
var express = require('express');
var pg = require('pg');
var router = express.Router();
require('dotenv');

//pg.defaults.ssl = true;

//checks to see if slope already calculated
//by comparing the input geometry with past geometry
//returns id of 0 if no matches.

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('api', {});
});

router.get('/slopebypin', function(req, res, next) {
  res.render('slopebypin');
});

router.get('/slopebypin/:pin', function(req, res, next) {
  var pin = _.replace(req.params.pin, new RegExp("-","g"), "");
  pin = _.replace(pin, new RegExp(" ","g"), "");
  var pinArray = pin.split(",");
  for (var i = 0; i < pinArray.length; i++) {
    if(pinArray[i].length === 10){
      pinArray[i] = pinArray[i] + '00000'
    }
  }
  var pinString = "{" + pinArray.join() + "}"; 

  console.log("pinString",pinString)

  var client = new pg.Client(process.env.CONNECTSTRING);
  client.connect(function (err) {
    if (err) throw err;

    client.query("select * from public.slopetool_getsloperecfrompins($1::varchar[])", [pinString], function (err, result) {
        if (err) throw err;
      res.json(result.rows[0]);
      //Close the connection
      client.end(function (err) {
        if (err) throw err;
      });   
    });
  });

});

module.exports = router;

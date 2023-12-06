var _ = require('lodash');
var express = require('express');
var router = express.Router();
require('dotenv').config('../.env');

//pg.defaults.ssl = true;

//checks to see if slope already calculated
//by comparing the input geometry with past geometry
//returns id of 0 if no matches.

/* GET users listing. */
router.get('/', function (req, res) {
  res.render('api', {});
});

router.get('/slopebypin', function (req, res) {
  res.render('slopebypin');
});

router.get('/slopebypin/:pin', async function (req, res) {
  var pin = _.replace(req.params.pin, new RegExp("-", "g"), "");
  pin = _.replace(pin, new RegExp(" ", "g"), "");
  var pinArray = pin.split(",");
  for (var i = 0; i < pinArray.length; i++) {
    if (pinArray[i].length === 10) {
      pinArray[i] = pinArray[i] + '00000'
    }
  }
  var pinString = "{" + pinArray.join() + "}";
  var client = res.locals.client;
  const result = await client.query("select * from public.slopetool_getsloperecfrompins($1::varchar[])", [pinString]);
  // console.log("result", result.rows[0]);
  res.json(result.rows[0]);
  // await client.end();
});

module.exports = router;

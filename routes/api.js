var _ = require('lodash');
var express = require('express');
var pg = require('pg');
var router = express.Router();
require('dotenv');

//pg.defaults.ssl = true;

//checks to see if slope already calculated
//by compareing the input geomery with past geometry
//returns id of 0 if no matches.
function getSqlStatementToCheckIfGeomIsAlreadyCalcuatedForPins(pins){
  var sqlStatementInner = "(SELECT st_union(p.shape) as \"GEOM\" " +
                   "FROM \"bc_property\" p " +
                   "WHERE  p.\"pinnum\" in ($1::text))";
  var sqlStatement = "SELECT slopetool_checkGeomg(" + sqlStatementInner + ")as \"ID\" ";
  return sqlStatement
}

function getSqlStatementToCalculateSlopeGeomForPins(pin){
  sqlStatment = "SELECT slopetool_getSlopeFromGeom(st_union(p.shape)) as \"ID\" " +
                "FROM \"bc_property\" p " +
                "WHERE  p.\"pinnum\" in ($1::text, $2::text, $3::text, $4::text, $5::text)";
  return sqlStatment;
}

function getSqlStatementThatSelectSlopeAttributesById(slopeId){
  var sqlStatement = "SELECT " + slopeId + " as \"id\" ,\"jurisdiction\" as \"jurisdiction\", " +
        "round(\"maxcontour\",2) as \"maxElevation\",  " +
        "round(\"acres\",2) as \"acres\", " +
        "round(\"avgslope\",2) as \"percentSlope\" " +
        "FROM \"sloperesults\" " +
        "WHERE \"insertid\" = " + slopeId;
  return sqlStatement
}


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('api', {});
});


router.get('/slopebypin', function(req, res, next) {
  res.render('slopebypin');
});

router.get('/slopebypin/:pin', function(req, res, next) {
  var pin = _.replace(req.params.pin, new RegExp("-","g"), "");
  var pin = _.replace(pin, new RegExp(" ","g"), "");
  var pinArray = pin.split(",");
  for (var i = 0; i < pinArray.length; i++) {
    if(pinArray[i].length === 10){
      pinArray[i] = pinArray[i] + '00000'
    }
  }


  getSlopeByPin(req.params.pin);

  var client = new pg.Client(process.env.CONNECTSTRING);
  client.connect(function (err) {
    if (err) throw err;

    client.query(getSqlStatementToCheckIfGeomIsAlreadyCalcuatedForPins(req.params.pin), [pin], function (err, result) {
      if (err) throw err;
      var slopeId = result.rows[0].ID;
      console.log(slopeId);
      if(!slopeId == 0){
        client.query(getSqlStatementToCalculateSlopeGeomForPins(req.params.pin), [pinArray[0], pinArray[1], pinArray[2], pinArray[3], pinArray[4]], function (err, result) {
          if (err) console.log(err);//throw err;

          var slopeId = result.rows[0].ID;
          console.log(slopeId);
          client.query(getSqlStatementThatSelectSlopeAttributesById(slopeId), function (err, result) {
            if (err) throw err;
            res.json(result.rows[0]);
            //Close the connection
            client.end(function (err) {
              if (err) throw err;
            });
          });
        });
      }else{
        client.query(getSqlStatementThatSelectSlopeAttributesById(slopeId), function (err, result) {
          if (err) throw err;
          res.json(result.rows[0]);
        });
        //Close the connection
        client.end(function (err) {
          if (err) throw err;
        });
      }
    });
  });

});





module.exports = router;

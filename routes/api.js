var _ = require('lodash');
var express = require('express');
var pg = require('pg');
var router = express.Router();

//pg.defaults.ssl = true;

function getSlopeByPin(pins){
  console.log(pins);
  //Get the SQL statement to determine if the geometry has already been processed
  var sqlStatement = getSqlStatementToCheckIfGeomIsAlreadyCalcuatedForPins(pins);

  //returns id of 0 if no matches.
  var slopeId = getCalculatedSlopeId(sqlStatement);

  // if(slopeId === 0){
  //   sqlStatment = createSqlStatementToCalculateSlopeGeomForPins(pins);
  //   //get id of for new slope calculation
  //   slopeId = getCalculatedSlopeId(sqlStatment);
  // }

  return getSlopeById(slopeId);
}

//checks to see if slope already calculated
//by compareing the input geomery with past geometry
//returns id of 0 if no matches.
function getSqlStatementToCheckIfGeomIsAlreadyCalcuatedForPins(pins){
  var sqlStatementInner = "(SELECT st_union(p.shape) as \"GEOM\" " +
                   "FROM \"bc_property\" p " +
                   "WHERE  p.\"pinnum\" in ('" + pins + "'))";
  var sqlStatement = "SELECT slopetool_checkGeomg(" + sqlStatementInner + ")as \"ID\" ";
  return sqlStatement
}

//returns id of 0 if no matches.
function getCalculatedSlopeId(sqlStatement){
  var slopeResultId = 0;

  var client = new pg.Client(process.env.DATABASE_URL);
  client.connect(function (err) {
    if (err) throw err;

    client.query(sqlStatement, function (err, result) {
      if (err) throw err;
      console.log("SLOPEID: " + result.rows[0].ID);
      var slopeId = result.rows[0].ID;
      if(slopeId === 0){
        //Do other query
      }else{
        client.query(getSqlStatementThatSelectSlopeAttributesById(result.rows[0].ID), function (err, result) {
          if (err) throw err;
          return result.rows[0];

          // disconnect the client
          client.end(function (err) {
            if (err) throw err;
          });
        });
      }
      // disconnect the client
      client.end(function (err) {
        if (err) throw err;
      });
    });
  });

  return slopeResultId;
}

function getSqlStatementToCalculateSlopeGeomForPins(pin){
  sqlStatment = "SELECT slopetool_getSlopeFromGeom(st_union(p.shape)) as \"ID\" " +
                "FROM \"bc_property\" p " +
                "WHERE  p.\"pinnum\" in ('" + pin + "')";
  return sqlStatment;
}

function getSqlStatementThatSelectSlopeAttributesById(slopeId){
  var sqlStatement = "SELECT "+slopeId+ " as \"id\" ,\"jurisdiction\" as \"jurisdiction\", " +
        "round(\"maxcontour\",2) as \"maxElevation\",  " +
        "round(\"acres\",2) as \"acres\", " +
        "round(\"avgslope\",2) as \"percentSlope\" " +
        "FROM \"sloperesults\" " +
        "WHERE \"insertid\" = " + slopeId;
  return sqlStatement
}

function getSlopeById(slopeId){
  console.log(slopeId);
  var sqlStatement = "SELECT "+slopeId+ " as \"ID\" ,\"jurisdiction\" as \"Jurisdiction\", " +
                    "round(\"maxcontour\",2) as \"Maxium Elevation\",  " +
                    "round(\"acres\",2) as \"Acres\", " +
                    "round(\"avgslope\",2) as \"Average Precent Slope\" " +
                    "FROM \"sloperesults\" " +
                    "WHERE \"insertid\" = " + slopeId;

  var client = new pg.Client(process.env.DATABASE_URL);
  client.connect(function (err) {
    if (err) throw err;

    client.query(sqlStatement, function (err, result) {
      if (err) throw err;
      return result.rows[0];

      // disconnect the client
      client.end(function (err) {
        if (err) throw err;
      });
    });
  });

}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('api', {});
});


router.get('/slope', function(req, res, next) {
  res.render('slope');
});

router.get('/slope/:pin', function(req, res, next) {
  //getSlopeByPin(req.params.pin);
  var client = new pg.Client(process.env.DATABASE_URL);
  client.connect(function (err) {
    if (err) throw err;

    client.query(getSqlStatementToCheckIfGeomIsAlreadyCalcuatedForPins(req.params.pin), function (err, result) {
      if (err) throw err;
      var slopeId = result.rows[0].ID;
      console.log("slopeId #1: " + result.rows[0].ID);
      if(slopeId == 0){
        client.query(getSqlStatementToCalculateSlopeGeomForPins(req.params.pin), function (err, result) {
          if (err) throw err;
          console.log("slopeId #2: " + JSON.stringify(result.rows[0].ID))
          var slopeId = result.rows[0].ID;
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

  // res.json({
  //   "maxElevation": "1111.00",
  //   "percentSlope": "11.11"
  // })
});





module.exports = router;

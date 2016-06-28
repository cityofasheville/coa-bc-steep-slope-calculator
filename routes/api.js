var _ = require('lodash');
var express = require('express');
var pg = require('pg');
var router = express.Router();

//pg.defaults.ssl = true;

function getSlopeByPin(pins){
  console.log(pins);
  //Get the SQL statement to determine if the geometry has already been processed
  var sqlStatement = createSqlStatementToCheckIfGeomIsAlreadyCalcuatedForPins(pins);

  //returns id of 0 if no matches.
  var slopeId = getCalculatedSlopeId(sqlStatement);

  if(slopeId === 0){
    sqlStatment = createSqlStatementToCalculateSlopeGeomForPins(pins);
    //get id of for new slope calculation
    slopeId = getCalculatedSlopeId(sqlStatment);
  }

  return getSlopeById(slopeId);
}

//checks to see if slope already calculated
//by compareing the input geomery with past geometry
//returns id of 0 if no matches.
function createSqlStatementToCheckIfGeomIsAlreadyCalcuatedForPins(pins){
  var sqlStatementInner = "(SELECT st_union(p.the_geom) as \"GEOM\" " +
                   "FROM \"bc_property\" p " +
                   "WHERE  p.\"pinnum\" in ('" + pins + "'))";
  var sqlStatement = "SELECT slopetool_checkGeomg(" + sqlStatementInner + ")as \"ID\" ";
  return sqlStatement
}

//returns id of 0 if no matches.
function getCalculatedSlopeId(sqlStatement){
  var slopeResultId = 0;

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query(sqlStatement, function(err, result) {
      done();
      if (err){
        console.error(err); response.send("Error " + err);
      }else{
        console.log(results)
      }
    });
  });

  return slopeResultId;
}

function createSqlStatementToCalculateSlopeGeomForPins(pin){
  sqlStatment = "SELECT slopetool_getSlopeFromGeom(st_union(p.the_geom)) as \"ID\" " +
                "FROM \"bc_property\" p " +
                "WHERE  p.\"pinnum\" in ('" + pin + "')";
  return sqlStatment;
}

function getSlopeById(slopeId){
  var sqlStatement = "SELECT "+slopeId+ " as \"ID\" ,\"JURISDICTION\" as \"Jurisdiction\", " +
                    "round(\"MAXCONTOUR\",2) as \"Maxium Elevation\",  " +
                    "round(\"ACRES\",2) as \"Acres\", " +
                    "round(\"AVGSLOPE\",2) as \"Average Precent Slope\" " +
                    "FROM \"SlopeResults\" " +
                    "WHERE \"INSERTID\" = " + slopeId;

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query(sqlStatement, function(err, result) {
      done();
      if (err){
        console.error(err); response.send("Error " + err);
      }else{
        console.log(results)
      }
    });
  });

  return slope;

}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('api', {});
});


router.get('/slope', function(req, res, next) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * from bc_property limit(10)', function(err, result) {
      done();
      if (err){
        console.error(err); response.send("Error " + err);
      }else{
        res.render('slope', {result: JSON.stringify(result)});
      }
    });
  });
  res.render('slope');
});

router.get('/slope/:pin', function(req, res, next) {
  //getSlopeByPin(req.params.pin);
  // var client = new pg.Client(process.env.DATABASE_URL);
  // client.connect(function (err) {
  //   if (err) throw err;
  //
  //   // execute a query on our database
  //   client.query('SELECT *   FROM public.bc_property limit(10)', function (err, result) {
  //     if (err) throw err;
  //     for (var i = 0; i < result.rows.length; i++) {
  //       console.log(result.rows[i]);
  //     }
  //     // just print the result to the console
  //
  //
  //     // disconnect the client
  //     client.end(function (err) {
  //       if (err) throw err;
  //     });
  //   });
  // });




  pg.connect(process.env.DATABASE_URL, function(err, client) {
    if (err) throw err;
    console.log("This is the DATABASE_URL " + JSON.stringify(process.env));
    console.log('Connected to postgres! Getting schemas...');

    client
      .query('SELECT * from bc_property limit(10)')
      .on('row', function(row) {
        console.log(JSON.stringify(row));
      });
  });

  res.json({
    "maxElevation": "1111.00",
    "percentSlope": "11.11"
  })
});





module.exports = router;

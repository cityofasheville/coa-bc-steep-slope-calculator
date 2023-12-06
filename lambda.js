var pg = require('pg');
require('source-map-support/register')
const serverlessExpress = require('@vendia/serverless-express');
const app = require('./app');
require('dotenv').config();

let serverlessExpressInstance;

async function DBConnect () {
  var pool = new pg.Pool({
    connectionString: process.env.CONNECTSTRING,
  });
  console.log("DB Connected");
  return pool;
}

async function setup (event, context) {
  client = await DBConnect();
  app.set('client', client);

  serverlessExpressInstance = serverlessExpress({ app });
  return serverlessExpressInstance(event, context);
}

async function handler (event, context) {
  if (serverlessExpressInstance) return serverlessExpressInstance(event, context);
  return await setup(event, context)
}

exports.handler = handler

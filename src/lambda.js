import pg from 'pg';
const { Pool } = pg;
import serverlessExpress from '@vendia/serverless-express';
import app from './app.js';
// import dotenv from 'dotenv';
// dotenv.config();

let serverlessExpressInstance;

async function DBConnect () {
  var pool = new Pool({
    connectionString: process.env.CONNECTSTRING,
  });
  console.log("DB Connected");
  return pool;
}

async function setup (event, context) {
  const client = await DBConnect();
  app.set('client', client);

  serverlessExpressInstance = serverlessExpress({ app });
  return serverlessExpressInstance(event, context);
}

export async function handler (event, context) {
  if (serverlessExpressInstance) return serverlessExpressInstance(event, context);
  return await setup(event, context)
}

import pg from 'pg';
const { Pool } = pg;
import serverlessExpress from '@vendia/serverless-express';
import app from './app.js';

async function DBConnect() {
  var pool = new Pool({
    connectionString: process.env.CONNECTSTRING,
  });
  console.log("DB Connected");
  return pool;
}

const client = await DBConnect();
app.set('client', client);

let serverlessExpressInstance = serverlessExpress({ app });

export async function handler(event, context) {
  return serverlessExpressInstance(event, context);
}

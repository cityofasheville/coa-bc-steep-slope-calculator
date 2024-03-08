import pg from 'pg';
const { Pool } = pg;
import app from './app.js';
// import dotenv from 'dotenv';
// dotenv.config();
const port = process.env.PORT || 3000;

async function DBConnect() {
  var pool = new Pool({
    connectionString: process.env.CONNECTSTRING,
  });
  console.log("DB Connected");
  return pool;
}

DBConnect()
  .then((client) => {
    app.set('client', client);
    app.listen(port);
    console.info(`listening on http://localhost:${port}`);
  });

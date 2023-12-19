// Node 20 reads .env file with command line "node --env-file=.env script.js", for earlier vers use dotenv
console.log( JSON.stringify({
  CONNECTSTRING: process.env.CONNECTSTRING
}) );
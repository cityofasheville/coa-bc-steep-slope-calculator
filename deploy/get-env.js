// This script is used to get the environment variables from the .env file and load them into Terraform.
// Called from config.tf
// Node 20 reads .env file with command line "node --env-file=.env script.js", for earlier vers use dotenv
console.log( JSON.stringify({
  CONNECTSTRING: process.env.CONNECTSTRING
}) );
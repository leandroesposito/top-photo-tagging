require("dotenv").config();
const connectionConfig = require("./connection_config");
const { Client } = require("pg");

const query = `
  DROP TABLE IF EXISTS objectives;
  DROP TABLE IF EXISTS leaderboard;
  DROP TABLE IF EXISTS games;
`;

async function execute() {
  console.log("Cleaning database...");
  const con = new Client(connectionConfig);
  await con.connect();
  await con.query(query);
  await con.end();
  console.log("Database is empty.");
}

module.exports = { execute };

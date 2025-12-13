require("dotenv").config();
const connectionConfig = require("./connection_config");
const { Client } = require("pg");

const query = `
  CREATE TABLE games (
    id INT PRIMARY KEY,
    name TEXT,
    credits TEXT,
    pictureFilename TEXT,
    thumbnail TEXT
  );

  CREATE TABLE objectives (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT,
    credits TEXT,
    pictureFilename TEXT,
    topBound REAL,
    leftBound REAL,
    bottomBound REAL,
    rightBound REAL,
    game_id INT REFERENCES games (id) ON DELETE CASCADE
  );

  CREATE TABLE leaderboard (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT,
    time TEXT,
    game_id INT REFERENCES games (id) ON DELETE CASCADE
  );
`;

async function execute() {
  console.log("Creating tables...");
  const con = new Client(connectionConfig);
  await con.connect();
  await con.query(query);
  await con.end();
  console.log("Tables created.");
}

module.exports = { execute };

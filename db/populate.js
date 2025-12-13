require("dotenv").config();
const connectionConfig = require("./connection_config");
const { Client } = require("pg");

const drop_tables = require("./drop_tables");
const create_tables = require("./create_tables");

const query = `
  INSERT INTO games
      (id, name, credits, pictureFilename, thumbnail)
    VALUES (
      1,
      'Amusement park by u_trippeltorch',
      'https://www.reddit.com/user/trippeltorch/',
      '1.jpeg',
      '1.jpg'
    ),
    (
      2,
      'Barton Springs by David Regone - Regone Studios',
      'https://regonestudios.com/',
      '2.jpeg',
      '2.jpg'
    ),
    (
      3,
      'S.P.A.C.E. CON 2225 Intergalactic convention By Chekavo - Egor Klyuchnyk',
      'https://www.instagram.com/chekavo/',
      '3.jpeg',
      '3.jpg'
    ),
    (
      4,
      'Time Keepers by Alexander Huérfano',
      'https://www.instagram.com/mierdinsky/',
      '4.png',
      '"4.jpg'
    ),
    (
      5,
      'Universe 113 Infested By Chekavo - Egor Klyuchnyk',
      'https://www.instagram.com/chekavo/',
      '5.jpeg',
      '5.jpg'
    ),
    (
      6,
      'Willy Wonka & The Chocolate Factory By Morgan Girvin',
      'https://morgangirvin.com/',
      '6.jpeg',
      '6.jpg'
    );
`;

async function execute() {
  await drop_tables.execute();
  await create_tables.execute();

  console.log("Inserting values...");
  const con = new Client(connectionConfig);
  await con.connect();
  await con.query(query);
  await con.end();
  console.log("Process finished.");
}

execute();

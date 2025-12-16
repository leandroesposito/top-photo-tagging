const gameDB = require("../db/game");

async function getAllGames(req, res) {
  const games = await gameDB.getAllGames();
  res.json(games);
}

module.exports = {
  getAllGames,
};

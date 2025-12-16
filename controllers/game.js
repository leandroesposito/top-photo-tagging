const { param } = require("express-validator");
const gameDB = require("../db/game");
const NotFoundError = require("../errors/NotFoundError");
const { checkValidations } = require("./validator-checker");

const gameExists = () => {
  return param("gameId").custom(async (value, { req }) => {
    const game = await gameDB.getGameWithObjectives(value);
    if (!game) {
      const error = new NotFoundError(`Game with id ${value} doesn't exist!`);
      req.locals = { error };
      throw error;
    }
    req.locals = { game };
  });
};

async function getAllGames(req, res) {
  const games = await gameDB.getAllGames();
  res.json(games);
}

const getGameWithObjectives = [
  gameExists(),
  checkValidations,
  async function getGameWithObjectives(req, res) {
    const game = req.locals.game;
    res.json(game);
  },
];

module.exports = {
  getAllGames,
  getGameWithObjectives,
};

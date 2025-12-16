const { Router } = require("express");
const gameController = require("../controllers/game");

const gameRouter = Router();

gameRouter.get("/", gameController.getAllGames);

module.exports = gameRouter;

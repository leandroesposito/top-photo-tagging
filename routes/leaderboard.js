const { Router } = require("express");
const leaderboardController = require("../controllers/leaderboard");

const leaderboardRouter = Router();

leaderboardRouter.get("/:gameId", leaderboardController.getLeaderboard);
leaderboardRouter.post("/:gameId", leaderboardController.postLeaderboard);

module.exports = leaderboardRouter;

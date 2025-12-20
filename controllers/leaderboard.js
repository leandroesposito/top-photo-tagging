const { body } = require("express-validator");
const { gameExists } = require("./game");
const { checkValidations } = require("./validator-checker");
const { validateToken } = require("./try");
const leaderboardDB = require("../db/leaderboard");

function validateTime(req, res, next) {
  if (!req.locals.tokenData.totalTime) {
    return res
      .status(400)
      .json({ error: "Invalid token, missing total game time!" });
  }
  next();
}

const validateName = () => {
  return body("name")
    .trim()
    .exists({ values: "falsy" })
    .withMessage("Name can't be empty!")
    .isLength({
      min: 0,
      max: 15,
    })
    .withMessage("Name must be shorter than 16 characters");
};

const getLeaderboard = [
  gameExists(),
  checkValidations,
  async function getLeaderboard(req, res) {
    const leaderboard = await leaderboardDB.getLeaderboard(req.params.gameId);
    res.json(leaderboard);
  },
];

const postLeaderboard = [
  gameExists(),
  validateToken(),
  validateTime,
  validateName(),
  checkValidations,
  async function postLeaderboard(req, res) {
    const gameId = req.params.gameId;
    const name = req.body.name;
    const time = req.locals.tokenData.totalTime;

    const scoreId = await leaderboardDB.submitScore(gameId, name, time);

    if (scoreId) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: "Error submitting score!" });
    }
  },
];

module.exports = {
  getLeaderboard,
  postLeaderboard,
};

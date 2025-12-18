require("dotenv").config();
const { body } = require("express-validator");
const jwt = require("jsonwebtoken");
const BadRequestError = require("../errors/BadRequestError");
const objectiveDB = require("../db/objective");
const { checkValidations } = require("./validator-checker");

const validateToken = () => {
  return body("token").custom((value, { req }) => {
    let tokenData;
    try {
      tokenData = jwt.verify(value, process.env.JWT_SECRET);
    } catch (err) {
      const error = new BadRequestError(`Invalid token: ${err.message}!`);
      req.locals = { error };
      throw error;
    }
    req.locals = { tokenData };
    return true;
  });
};

const validateTry = () => {
  return body("objectiveId").custom(async (value, { req }) => {
    const currentObjectives = Object.keys(req.locals.tokenData.objectives);
    if (!currentObjectives.includes(value.toString())) {
      const error = new BadRequestError(
        `Object with id ${value} doesn't belong to current game!`
      );
      req.locals = { error };
      throw error;
    }
    return true;
  });
};

const validateCoords = () => {
  return body("coords").custom((value, { req }) => {
    if (!value.x || Number.isNaN(+value.x)) {
      const error = new BadRequestError(
        `X coord is required and must be a number!`
      );
      req.locals = { error };
      throw error;
    }
    if (!value.y || Number.isNaN(+value.y)) {
      const error = new BadRequestError(
        `Y coord is required and must be a number!`
      );
      req.locals = { error };
      throw error;
    }
    return true;
  });
};

const postTry = [
  validateToken(),
  validateTry(),
  validateCoords(),
  checkValidations,
  async function postTry(req, res) {
    const { tokenData } = req.locals;
    const { coords, objectiveId } = req.body;

    const boundaries = await objectiveDB.getObjectiveBoundaries(objectiveId);
    let success;
    let objective;

    if (
      boundaries.leftbound < coords.x &&
      coords.x < boundaries.rightbound &&
      boundaries.topbound < coords.y &&
      coords.y < boundaries.bottombound
    ) {
      success = true;
      objective = {
        id: objectiveId,
        ...boundaries,
      };
      tokenData.objectives[objectiveId] = true;
    } else {
      success = false;
    }

    const allFound = Object.values(tokenData.objectives).every((o) => o);
    if (allFound) {
      const startTime = new Date(tokenData.startTime);
      const currentTime = new Date();
      const totalTime = new Date(currentTime - startTime);
      const totalTimeString = totalTime.toISOString().substring(11, 19);

      tokenData.totalTime = totalTimeString;
      return res.json({
        success: true,
        objective,
        win: true,
        token: jwt.sign(tokenData, process.env.JWT_SECRET),
      });
    }

    if (success) {
      return res.json({
        success: true,
        objective,
        token: jwt.sign(tokenData, process.env.JWT_SECRET),
      });
    }

    res.json({ fail: true });
  },
];

module.exports = {
  postTry,
  validateToken,
};

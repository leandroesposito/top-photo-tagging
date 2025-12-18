const { Router } = require("express");
const tryController = require("../controllers/try");

const tryRouter = Router();

tryRouter.post("/", tryController.postTry);

module.exports = tryRouter;

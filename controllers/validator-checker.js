const { validationResult } = require("express-validator");

function checkValidations(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let status = 400;
    if (req.locals?.error) {
      status = req.locals.error.statusCode;
    }
    res.status(status).json({ errors: errors.array().map((e) => e.msg) });
  }
  next();
}

module.exports = { checkValidations };

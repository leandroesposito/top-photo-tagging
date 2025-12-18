require("dotenv").config();

module.exports = {
  connectionString: process.env.DATABASE_URL_PROD,
};

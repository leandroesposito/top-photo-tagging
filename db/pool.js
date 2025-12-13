const connection_config = require("./connection_config");
const { Pool } = require("pg");

const pool = new Pool(connection_config);

module.exports = pool;

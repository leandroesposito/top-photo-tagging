const pool = require("./pool");

async function runQuery(query, params) {
  const res = await pool.query(query, params);

  return res.rows;
}

module.exports = { runQuery };

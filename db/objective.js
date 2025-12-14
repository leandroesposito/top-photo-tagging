const { runQuery } = require("./queries");

async function getObjectiveBoundaries(id) {
  const query = `
    SELECT
      topBound, leftBound, bottomBound, rightBound
    FROM
      objectives
    WHERE
      id=$1;
  `;
  const params = [id];
  const boundaries = (await runQuery(query, params))[0];

  return boundaries;
}

module.exports = {
  getObjectiveBoundaries,
};

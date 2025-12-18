const { runQuery } = require("./queries");

async function getLeaderboard(gameId) {
  const query = "SELECT * FROM leaderboard WHERE game_id=$1 ORDER BY time;";
  const params = [gameId];

  const leaderboard = await runQuery(query, params);
  return leaderboard;
}

async function submitScore(gameId, name, time) {
  const query = `
    INSERT INTO leaderboard
      (name, time, game_id)
    VALUES
      ($1, $2, $3)
    RETURNING id;
  `;
  const params = [name, time, gameId];

  return (await runQuery(query, params))[0];
}

module.exports = {
  getLeaderboard,
  submitScore,
};

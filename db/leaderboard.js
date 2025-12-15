import { runQuery } from "./queries";

async function getLeaderboard(gameId) {
  const query = "SELECT * FROM leaderboard WHERE game_id=$1 ORDER BY time;";
  const params = [gameId];

  const leaderboard = await runQuery(query, params);
  return leaderboard;
}

async function submitScore(gameId, name, time) {
  const query = `
    INSERT INTO
      leaderboard
    (name, time, game_id)
    VALUES
    ($1, $2, $3);
  `;
  const params = [name, time, gameId];

  await runQuery(query, params);
}

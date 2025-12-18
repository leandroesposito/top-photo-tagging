const { runQuery } = require("./queries");

async function getAllGames() {
  const query = "SELECT id, name, thumbnail FROM games";

  return await runQuery(query);
}

async function getGameWithObjectives(id) {
  const gameQuery = `
    SELECT
      id,
      name,
      credits,
      pictureFilename
    FROM
      games
    WHERE
      id=$1;
  `;
  const gameParams = [id];

  const game = (await runQuery(gameQuery, gameParams))[0];

  if (!game) {
    return null;
  }

  const objectivesQuery = `
    SELECT id, name, pictureFilename FROM objectives WHERE game_id=$1;
  `;
  const objectivesParams = [id];

  const objectives = await runQuery(objectivesQuery, objectivesParams);

  game.objectives = {};

  objectives.forEach((o) => {
    game.objectives[o.id] = o;
  });

  return game;
}

module.exports = {
  getAllGames,
  getGameWithObjectives,
};

import { gamesData, leaderboard } from "./gamesData.js";

async function getGameObjectives(gameId) {
  const game = gamesData[gameId];
  const objectives = game.objectives;
  const data = {};

  for (const id in objectives) {
    const objective = objectives[id];
    data[id] = (({ id, name, pictureFilename }) => {
      return { id, name, pictureFilename };
    })(objective);
  }

  return data;
}

async function getObjectivesLocation(gameId) {
  return gamesData[gameId].objectives;
}

async function getGameData(gameId) {
  const game = gamesData[gameId];
  const data = (({ id, name, thumbnail, pictureFilename }) => {
    return { id, name, thumbnail, pictureFilename };
  })(game);

  data.objectives = await getGameObjectives(gameId);

  return data;
}

async function getAllGames() {
  const games = {};

  for (const id in gamesData) {
    games[id] = await getGameData(id);
  }

  return games;
}

async function getLeaderboard(gameId) {
  return leaderboard[gameId];
}

async function submitTry(gameId, objectiveId, pos) {
  const objective = gamesData[gameId].objectives[objectiveId];

  if (
    objective.left < pos.x &&
    pos.x < objective.right &&
    objective.top < pos.y &&
    pos.y < objective.bottom
  ) {
    if (objectiveId === 3) {
      // use random value as win to test
      return { success: true, win: true, token: "token", objective };
    } else {
      return { success: true, token: "token", objective };
    }
  } else {
    return { fail: true, objective };
  }
}

async function submitScore(gameId, name, time) {
  leaderboard[gameId].push({ gameId, name, time });

  return { success: true };
}

export default {
  getAllGames,
  getGameData,
  getGameObjectives,
  getObjectivesLocation,
  getLeaderboard,
  submitTry,
  submitScore,
};

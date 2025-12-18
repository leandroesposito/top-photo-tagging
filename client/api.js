import { gamesData, leaderboard } from "./gamesData.js";

async function makeRequest(endpoint, data) {
  const method = data ? "POST" : "GET";
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
  };

  if (data) {
    data.token = localStorage.getItem("token");
    options.body = JSON.stringify(data);
  }

  return fetch(endpoint, options)
    .then((response) => {
      if (response.status === 404) {
        return {
          error: "404",
        };
      }

      return response.json();
    })
    .then((json) => {
      if (json.token) {
        localStorage.setItem("token", json.token);
      }
      return json;
    })
    .catch((error) => {
      console.error("FETCH ERROR", error);
      if (error.message.startsWith("NetworkError")) {
        return { errors: [error.message] };
      }
      throw error;
    });
}

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
  try {
    const res = await makeRequest(`http://localhost:3000/games/${gameId}`);
    return res;
  } catch (error) {
    console.error("ERROR", error);
  }
}

async function getAllGames() {
  try {
    const res = await makeRequest("http://localhost:3000/games");
    return res;
  } catch (error) {
    console.error("ERROR", error);
  }
}

async function getLeaderboard(gameId) {
  return leaderboard[gameId];
}

async function submitTry(objectiveId, coords) {
  const data = {
    objectiveId,
    coords,
  };

  try {
    const res = await makeRequest("http://localhost:3000/try", data);
    return res;
  } catch (error) {
    console.error("ERROR", error);
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

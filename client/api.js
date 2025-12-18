const rootEndpoint = "https://top-photo-tagging.onrender.com";

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

async function getGameData(gameId) {
  try {
    const res = await makeRequest(`${rootEndpoint}/games/${gameId}`);
    return res;
  } catch (error) {
    console.error("ERROR", error);
  }
}

async function getAllGames() {
  try {
    const res = await makeRequest(`${rootEndpoint}/games`);
    return res;
  } catch (error) {
    console.error("ERROR", error);
  }
}

async function getLeaderboard(gameId) {
  try {
    const res = await makeRequest(`${rootEndpoint}/leaderboard/${gameId}`);
    return res;
  } catch (error) {
    console.error("ERROR", error);
  }
}

async function submitTry(objectiveId, coords) {
  const data = {
    objectiveId,
    coords,
  };

  try {
    const res = await makeRequest(`${rootEndpoint}/try`, data);
    return res;
  } catch (error) {
    console.error("ERROR", error);
  }
}

async function submitScore(gameId, name) {
  try {
    const data = { name };
    const res = await makeRequest(
      `${rootEndpoint}/leaderboard/${gameId}`,
      data
    );
    return res;
  } catch (error) {
    console.error("ERROR", error);
  }
}

export default {
  getAllGames,
  getGameData,
  getLeaderboard,
  submitTry,
  submitScore,
};

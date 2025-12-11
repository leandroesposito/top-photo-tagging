import api from "./api.js";

async function initSite() {
  const games = await api.getAllGames();

  const gamesContainer = document.querySelector(".games");
  gamesContainer.innerHTML = "";
  for (const gameId in games) {
    const game = games[gameId];
    const gameOption = createGameOption(game);
    gamesContainer.appendChild(gameOption);
  }
}

function handleGameOptionClick(event) {
  const gameOption = event.target.closest(".game-option");
  const id = gameOption.dataset.id;
  initGame(id);
}

function createGameOption(game) {
  const gameOption = document.createElement("article");
  gameOption.classList.add("card");
  gameOption.classList.add("game-option");
  gameOption.dataset.id = game.id;
  gameOption.addEventListener("click", handleGameOptionClick);

  const thumbnail = document.createElement("div");
  thumbnail.classList.add("thumbnail");

  const img = document.createElement("img");
  img.src = "./imgs/thumbnails/" + game.thumbnail;
  thumbnail.appendChild(img);
  gameOption.appendChild(thumbnail);

  const description = document.createElement("div");
  description.classList.add("description");
  gameOption.appendChild(description);

  const name = document.createElement("div");
  name.classList.add("name");
  name.textContent = game.name;
  description.appendChild(name);

  return gameOption;
}

async function initGame(gameId) {
  currentGame = await api.getGameData(gameId);

  createObjectivesDisplay(currentGame.objectives);
  createObjectivesDropdown(currentGame.objectives);

  const gameSetupContainer = document.querySelector(".game-setup");
  gameSetupContainer.remove();

  const gameplayContainer = document.querySelector(".game-play");
  gameplayContainer.classList.remove("hidden");

  const body = document.querySelector(".body");
  body.classList.add("playing");

  scaleFactor = 0;
  setImage(currentGame.pictureFilename);
  updateZoom();
  initTimer();
  await initLeaderboard();
}

function initTimer() {
  const timerElement = document.querySelector(".timer");
  const startTime = Date.now();
  timerInterval = setInterval(() => {
    const now = Date.now();
    const elapsedTime = new Date(now - startTime);
    timerElement.textContent = elapsedTime.toISOString().substr(11, 8);
  }, 100);
  timerElement.classList.remove("hidden");
}

async function initLeaderboard() {
  const scores = await api.getLeaderboard(currentGame.id);
  const scoresContainer = document.querySelector(".leaderboard .scores");
  scoresContainer.innerHTML = "";

  scores.forEach((score) => {
    const nameElement = document.createElement("div");
    nameElement.classList.add("name");
    nameElement.textContent = score.name;
    scoresContainer.appendChild(nameElement);

    const timeElement = document.createElement("div");
    timeElement.classList.add("time");
    timeElement.textContent = score.time;
    scoresContainer.appendChild(timeElement);
  });

  leaderboardButton.classList.remove("hidden");
}

function createObjectivesDisplay(objectives) {
  const objectivesContainer = document.querySelector(".objectives");
  objectivesContainer.innerHTML = "";
  for (const id in objectives) {
    const objective = objectives[id];
    const objectiveElement = createObjectiveElement(objective);
    objectivesContainer.appendChild(objectiveElement);
  }
}

function createObjectiveElement(objective) {
  const objectiveElement = document.createElement("article");
  objectiveElement.classList.add("card");
  objectiveElement.classList.add("objective");
  objectiveElement.dataset.id = objective.id;

  const thumbnail = document.createElement("div");
  thumbnail.classList.add("thumbnail");

  const img = document.createElement("img");
  img.src = "./imgs/objectives/" + objective.pictureFilename;
  thumbnail.appendChild(img);
  objectiveElement.appendChild(thumbnail);

  const description = document.createElement("div");
  description.classList.add("description");
  objectiveElement.appendChild(description);

  const name = document.createElement("div");
  name.classList.add("name");
  name.textContent = objective.name;
  description.appendChild(name);

  return objectiveElement;
}

async function handleObjectiveSubmit(event) {
  const target = event.target;
  const objectiveId = parseInt(target.dataset.id);

  const res = await api.submitTry(
    currentGame.id,
    objectiveId,
    markerRelativePos
  );

  if (res.success) {
    handleSuccess(res);
  } else if (res.fail) {
    handleFail(objectiveId);
  }

  if (res.win) {
    handleWin();
  }

  const objectivesDropdown = document.querySelector(".objectives-dropdown");
  objectivesDropdown.classList.add("hidden");
}

function handleSuccess(res) {
  const objectiveId = res.objective.id;

  localStorage.setItem("token", res.token);

  objectivesFound.push(res.objective);
  drawTarget(res.objective);
  paintFound(objectiveId);
  showFlashMessage(
    `You have found ${currentGame.objectives[objectiveId].name}!`,
    "success"
  );
  marker.classList.add("hidden");
}

function handleFail(objectiveId) {
  showFlashMessage(
    `${currentGame.objectives[objectiveId].name} is not there, try again.`,
    "fail"
  );
}

function handleWin() {
  const scoreSubmitContainer = document.querySelector(".score-submit");
  scoreSubmitContainer.classList.remove("hidden");

  clearInterval(timerInterval);
}

function paintFound(objectiveId) {
  const objectiveElements = document.querySelectorAll(
    `.objective[data-id="${objectiveId}"]`
  );

  objectiveElements.forEach((e) => e.classList.add("found"));
}

function showFlashMessage(message, type) {
  const div = document.createElement("div");
  div.textContent = message;
  div.classList.add("flash-message");
  div.classList.add(type);
  div.classList.add("hidden-message");

  document.body.appendChild(div);
  setTimeout(() => {
    div.classList.remove("hidden-message");
  }, 10);

  setTimeout(() => {
    document.body.addEventListener("click", function dismissFlashMessage() {
      div.classList.add("hidden-message");
      setTimeout(() => {
        div.remove();
      }, 1000);
      document.body.removeEventListener("click", dismissFlashMessage);
    });
  }, 3000);
}

function createObjectivesDropdown(objectives) {
  const objectivesDropdown = document.querySelector(".objectives-dropdown");
  objectivesDropdown.innerHTML = "";

  for (const id in objectives) {
    const objective = objectives[id];
    const objectiveButton = document.createElement("button");
    objectiveButton.textContent = objective.name;
    objectiveButton.classList.add("objective");
    objectiveButton.dataset.id = objective.id;
    objectivesDropdown.appendChild(objectiveButton);
    objectiveButton.addEventListener("click", handleObjectiveSubmit);
  }

  return objectivesDropdown;
}

function setImage(imageName) {
  imgtag.src = "./imgs/pictures/" + imageName;
}

function handleGameClick(event) {
  const target = event.target;
  if (target !== imgtag) return;
  // convert mouse position relative to the picture's dimensions
  // to a value in a scale between 0 and 1
  markerRelativePos = {
    x: event.offsetX / imgtag.clientWidth,
    y: event.offsetY / imgtag.clientHeight,
  };

  const pos = { x: event.offsetX, y: event.offsetY };
  placeMarker(pos);
  placeObjectivesDropdown(pos, markerRelativePos);
}

function placeMarker(pos) {
  const markerSize = imgtag.offsetWidth * 0.02;
  marker.style.width = markerSize + "px";
  marker.style.height = markerSize + "px";
  marker.style.left = pos.x - markerSize / 2 + "px";
  marker.style.top = pos.y - markerSize / 2 + "px";
  marker.classList.remove("hidden");
}

function placeObjectivesDropdown(pos, markerRelativePos) {
  const objectivesDropdown = document.querySelector(".objectives-dropdown");
  const markerSize = imgtag.offsetWidth * 0.02;

  if (markerRelativePos.x < 0.5) {
    objectivesDropdown.style.left = pos.x + markerSize / 2 + "px";
    objectivesDropdown.style.right = null;
  } else {
    objectivesDropdown.style.left = null;
    objectivesDropdown.style.right =
      imgtag.clientWidth - pos.x + markerSize / 2 + "px";
  }

  if (markerRelativePos.y < 0.5) {
    objectivesDropdown.style.top = pos.y + markerSize / 2 + "px";
    objectivesDropdown.style.bottom = null;
  } else {
    objectivesDropdown.style.top = null;
    objectivesDropdown.style.bottom =
      imgtag.clientHeight - pos.y + markerSize / 2 + "px";
  }

  objectivesDropdown.classList.remove("hidden");
}

function handleGameHover(event) {
  const target = event.target;
  if (target !== imgtag) return;

  const imageContainerSize = imageContainer.getBoundingClientRect();

  const fixedCoords = {
    x: event.clientX - imageContainerSize.left,
    y: event.clientY - imageContainerSize.top,
  };

  const realtivePos = {
    x: fixedCoords.x / imageContainer.clientWidth,
    y: fixedCoords.y / imageContainer.clientHeight,
  };

  imageContainer.scroll(
    imgtag.offsetWidth * realtivePos.x - imageContainer.clientWidth / 2,
    imgtag.offsetHeight * realtivePos.y - imageContainer.clientHeight / 2
  );
}

function handleLeaderboardButton() {
  const leaderboard = document.querySelector(".leaderboard");
  leaderboard.classList.remove("hidden");
}

function handleLeaderboardCloseButton() {
  const leaderboard = document.querySelector(".leaderboard");
  leaderboard.classList.add("hidden");
}

async function handleScoreSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const time = document.querySelector(".timer").textContent;

  const res = await api.submitScore(currentGame.id, formData.get("name"), time);

  if (res.success) {
    await initLeaderboard();
    handleLeaderboardButton();
  }

  const scoreSubmitContainer = event.target.closest(".score-submit");
  scoreSubmitContainer.classList.add("hidden");
}

function updateZoom() {
  const naturalWidth = imgtag.naturalWidth;
  const naturalHeight = imgtag.naturalHeight;

  if (naturalWidth === 0 || scaleFactor === 0) {
    imgtag.style.width = "100%";
  } else {
    imgtag.style.width = naturalWidth * scaleFactor + "px";
    imgtag.style.height = naturalHeight * scaleFactor + "px";
  }

  marker.classList.add("hidden");
  document.querySelector(".objectives-dropdown").classList.add("hidden");
  showFound();
}

function scaleIn() {
  const clientWidth = imageContainer.clientWidth;
  const naturalWidth = imgtag.naturalWidth;
  scaleFactor = Math.min(
    Math.max(clientWidth / naturalWidth + 0.1, scaleFactor + 0.1),
    2
  );
  updateZoom();
}

function scaleOut() {
  const clientWidth = imageContainer.clientWidth;
  const naturalWidth = imgtag.naturalWidth;

  if (naturalWidth === 0) {
    scaleFactor = 0;
  } else {
    scaleFactor = Math.max(scaleFactor - 0.1, clientWidth / naturalWidth);
  }

  updateZoom();
}

function handleGameWheel(event) {
  event.preventDefault();
  if (event.deltaY < 0) {
    scaleIn();
  } else {
    scaleOut();
  }
}

function handleObjectivesMouseEnter() {
  objective.classList.toggle("bottom");
}

function handleImgTagOnload() {
  imageContainer.scrollIntoView(false);
}

function showFound() {
  removeTargets();

  objectivesFound.forEach((objective) => {
    drawTarget(objective);
  });
}

function removeTargets() {
  const objectives = document.querySelectorAll(".target-box");
  objectives.forEach((o) => {
    o.remove();
  });
}

function drawTarget(objective) {
  const targetBox = document.createElement("div");
  const width = imgtag.clientWidth;
  const height = imgtag.clientHeight;

  targetBox.dataset.name = objective.name;

  targetBox.style.left = objective.left * width + "px";
  targetBox.style.top = objective.top * height + "px";
  targetBox.style.width = (objective.right - objective.left) * width + "px";
  targetBox.style.height = (objective.bottom - objective.top) * height + "px";

  targetBox.classList.add("target-box");

  imageContainer.appendChild(targetBox);
}

const imgtag = document.querySelector(".image-container img");
const imageContainer = document.querySelector(".image-container");
const marker = document.querySelector(".marker");
let currentGame = null;
let markerRelativePos = { x: null, y: null };
let scaleFactor = 0;
const objectivesFound = [];
let timerInterval;
const leaderboardButton = document.querySelector(".leaderboard-button");
const leaderboardCloseButton = document.querySelector(
  ".leaderboard .close-button"
);
const scoreSubmitForm = document.querySelector(".score-submit form");
const objective = document.querySelector(".objectives");
const zoomInButton = document.querySelector(".zoom-in");
const zoomOutButton = document.querySelector(".zoom-out");

imageContainer.addEventListener("click", handleGameClick);

imageContainer.addEventListener("mousemove", handleGameHover);

imageContainer.addEventListener("wheel", handleGameWheel);

leaderboardButton.addEventListener("click", handleLeaderboardButton);

leaderboardCloseButton.addEventListener("click", handleLeaderboardCloseButton);

scoreSubmitForm.addEventListener("submit", handleScoreSubmit);

objective.addEventListener("mouseenter", handleObjectivesMouseEnter);

imgtag.addEventListener("load", handleImgTagOnload);

zoomInButton.addEventListener("click", scaleIn);
zoomOutButton.addEventListener("click", scaleOut);

await initSite();

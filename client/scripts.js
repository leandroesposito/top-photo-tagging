import api from "./api.js";
import htmlCreator from "./htmlCreator.js";

async function initSite() {
  const games = await api.getAllGames();
  hideElements(".main-loading");

  const gamesContainer = document.querySelector(".games");
  gamesContainer.innerHTML = "";
  for (const gameId in games) {
    const game = games[gameId];
    const gameOption = htmlCreator.createGameOption(
      game,
      handleGameOptionClick
    );
    gamesContainer.appendChild(gameOption);
  }
}

function handleGameOptionClick(event) {
  const gameOption = event.target.closest(".game-option");
  const id = gameOption.dataset.id;
  initGame(id);
}

async function initGame(gameId) {
  const gameSetupContainer = document.querySelector(".game-setup");
  gameSetupContainer.remove();

  showElements(".main-loading");
  currentGame = await api.getGameData(gameId);
  hideElements(".main-loading");

  generateObjectivesDisplay(currentGame.objectives);
  generateObjectivesDropdown(currentGame.objectives);

  showElements(".game-play");
  showElements(".game");

  const body = document.querySelector(".body");
  body.classList.add("playing");

  scaleFactor = 0;
  setImage(currentGame.picturefilename);
  updateZoom();
  initTimer();
  await initLeaderboard();

  const footer = document.querySelector("footer");
  footer.innerHTML = `Picture: ${currentGame.name}, You can find more of this artist <a href="${currentGame.credits}" target="_blank">Here</a>`;
  handleBigScreenClick();
  scoreSubmitForm.reset();
}

function initTimer() {
  const timerElement = document.querySelector(".timer");
  const startTime = Date.now();
  timerInterval = setInterval(() => {
    const now = Date.now();
    const elapsedTime = new Date(now - startTime);
    timerElement.textContent = elapsedTime.toISOString().substring(11, 19);
  }, 100);
  timerElement.classList.remove("hidden");
}

async function initLeaderboard() {
  const scores = await api.getLeaderboard(currentGame.id);
  const scoresContainer = document.querySelector(".leaderboard .scores");
  scoresContainer.innerHTML = "";
  scoresContainer.appendChild(htmlCreator.createScoresDisplay(scores));

  leaderboardButton.classList.remove("hidden");
}

function generateObjectivesDisplay(objectives) {
  const objectivesContainer = document.querySelector(".objectives");
  objectivesContainer.appendChild(
    htmlCreator.createObjectivesDisplay(objectives)
  );
}

async function handleObjectiveSubmit(event) {
  hideElements(".objectives-dropdown .buttons");
  showElements(".dropdown-loading");
  const target = event.target;
  const objectiveId = parseInt(target.dataset.id);

  const res = await api.submitTry(objectiveId, markerRelativePos);

  if (res.success) {
    handleSuccess(res);
  } else if (res.fail) {
    handleFail(objectiveId);
  }

  if (res.win) {
    handleWin();
  }

  hideElements(".objectives-dropdown");
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
  showElements(".score-submit");
  clearInterval(timerInterval);
}

function paintFound(objectiveId) {
  const objectiveElements = document.querySelectorAll(
    `.objective[data-id="${objectiveId}"]`
  );

  objectiveElements.forEach((e) => e.classList.add("found"));
}

function showFlashMessage(message, type) {
  htmlCreator.createFlashMessage(message, type).show();
}

function generateObjectivesDropdown(objectives) {
  const objectivesDropdown = document.querySelector(".objectives-dropdown");
  objectivesDropdown.appendChild(
    htmlCreator.createObjectivesDropdown(objectives, handleObjectiveSubmit)
  );
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
  placeObjectivesDropdown(event);
}

function placeMarker(pos) {
  const markerSize = imgtag.offsetWidth * 0.02;
  marker.style.width = markerSize + "px";
  marker.style.height = markerSize + "px";
  marker.style.left = pos.x - markerSize / 2 + "px";
  marker.style.top = pos.y - markerSize / 2 + "px";
  marker.classList.remove("hidden");
}

function placeObjectivesDropdown(event) {
  const objectivesDropdown = document.querySelector(".objectives-dropdown");
  const markerSize = imgtag.offsetWidth * 0.02;

  const imageContainerSize = imageContainer.getBoundingClientRect();

  const fixedCoords = {
    x: event.clientX - imageContainerSize.left,
    y: event.clientY - imageContainerSize.top,
  };

  const realtivePos = {
    x: fixedCoords.x / imageContainer.clientWidth,
    y: fixedCoords.y / imageContainer.clientHeight,
  };

  const pos = { x: event.offsetX, y: event.offsetY };

  if (realtivePos.x < 0.5) {
    objectivesDropdown.style.left = pos.x + markerSize / 2 + "px";
    objectivesDropdown.style.right = null;
  } else {
    objectivesDropdown.style.left = null;
    objectivesDropdown.style.right =
      imgtag.clientWidth - pos.x + markerSize / 2 + "px";
  }

  if (realtivePos.y < 0.5) {
    objectivesDropdown.style.top = pos.y + markerSize / 2 + "px";
    objectivesDropdown.style.bottom = null;
  } else {
    objectivesDropdown.style.top = null;
    objectivesDropdown.style.bottom =
      imgtag.clientHeight - pos.y + markerSize / 2 + "px";
  }

  hideElements(".dropdown-loading");
  showElements(".objectives-dropdown .buttons");
  objectivesDropdown.classList.remove("hidden");
}

function handleGameHover(event) {
  const followMouse = document.querySelector(".follow-mouse").checked;
  if (!followMouse) {
    return;
  }

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
  showElements(".leaderboard");
}

function handleLeaderboardCloseButton() {
  hideElements(".leaderboard");
}

async function handleScoreSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const name = formData.get("name");

  if (name.trim() === "") {
    showFlashMessage("Name field can't be empty", "fail");
    return;
  }
  const submitButton = event.target.querySelector("button");
  submitButton.disabled = true;

  const res = await api.submitScore(currentGame.id, formData.get("name"));

  if (res.success) {
    await initLeaderboard();
    handleLeaderboardButton();
  }

  hideElements(".score-submit");
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
  if (objectivesContainer.classList.contains("inside")) {
    objectivesContainer.classList.toggle("bottom");
    configContainer.classList.toggle("bottom");
  }
}

function handleImgTagOnload() {
  document.querySelector(".game").scrollIntoView(false);
}

function handleBigScreenClick() {
  if (!bigScreenControll.checked) {
    objectivesContainer.classList.remove("inside");
    imageContainer.classList.remove("full-screen");
    configContainer.classList.remove("bottom");
  } else {
    imageContainer.classList.add("full-screen");
    objectivesContainer.classList.add("inside");
    if (objectivesContainer.classList.contains("bottom")) {
      configContainer.classList.remove("bottom");
    } else {
      configContainer.classList.add("bottom");
    }
  }
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
  const targetsContainer = document.querySelector(".targets-container");
  const targetBox = htmlCreator.createTargetBox(
    imgtag.clientWidth,
    imgtag.clientHeight,
    objective
  );

  targetsContainer.appendChild(targetBox);
}

function showElements(className) {
  document.querySelectorAll(className).forEach((elem) => {
    elem.classList.remove("hidden");
  });
}

function hideElements(className) {
  document.querySelectorAll(className).forEach((elem) => {
    elem.classList.add("hidden");
  });
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
const objectivesContainer = document.querySelector(".objectives");
const zoomInButton = document.querySelector(".zoom-in");
const zoomOutButton = document.querySelector(".zoom-out");
const bigScreenControll = document.querySelector(".big-screen");
const configContainer = document.querySelector(".config");

imageContainer.addEventListener("click", handleGameClick);

imageContainer.addEventListener("mousemove", handleGameHover);

imageContainer.addEventListener("wheel", handleGameWheel);

leaderboardButton.addEventListener("click", handleLeaderboardButton);

leaderboardCloseButton.addEventListener("click", handleLeaderboardCloseButton);

scoreSubmitForm.addEventListener("submit", handleScoreSubmit);

objectivesContainer.addEventListener("mouseenter", handleObjectivesMouseEnter);

imgtag.addEventListener("load", handleImgTagOnload);

zoomInButton.addEventListener("click", scaleIn);
zoomOutButton.addEventListener("click", scaleOut);

bigScreenControll.addEventListener("click", handleBigScreenClick);

await initSite();

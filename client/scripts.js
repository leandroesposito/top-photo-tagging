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

  scaleFactor = 0;
  setImage(currentGame.pictureFilename);
  updateZoom();
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
  objectiveElement.addEventListener("click", handleGameOptionClick);

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

  const res = await api.submitTry(
    currentGame.id,
    parseInt(target.dataset.id),
    markerRelativePos
  );

  console.log(res);
}

function createObjectivesDropdown(objectives) {
  const objectivesDropdown = document.querySelector(".objectives-dropdown");
  objectivesDropdown.innerHTML = "";

  for (const id in objectives) {
    const objective = objectives[id];
    const objectiveButton = document.createElement("button");
    objectiveButton.textContent = objective.name;
    objectiveButton.dataset.id = objective.id;
    objectivesDropdown.appendChild(objectiveButton);
    objectiveButton.addEventListener("click", handleObjectiveSubmit);
  }

  return objectivesDropdown;
}

function setImage(imageName) {
  imgtag.src = "./imgs/pictures/" + imageName;
}

function handleImageButtonClick(event) {
  const imageId = event.target.dataset.imageId;
  const imageName = images[imageId];
  setImage(imageName);
  updateZoom();
  showObjectives();
}

function handleGameClick(event) {
  console.log(event);
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

const imgtag = document.querySelector("img");
const imageContainer = document.querySelector(".image-container");
const marker = document.querySelector(".marker");
let currentGame = null;
let markerRelativePos = { x: null, y: null };
let scaleFactor = 0;

imageContainer.addEventListener("click", handleGameClick);

imageContainer.addEventListener("mousemove", handleGameHover);

imageContainer.addEventListener("wheel", handleGameWheel);

await initSite();

function removeObjectives() {
  const objectives = document.querySelectorAll(".target-box");
  objectives.forEach((o) => {
    o.remove();
  });
}

async function showObjectives() {
  removeObjectives();
  const objectives = await api.getObjectivesLocation(currentGame.id);

  for (const id in objectives) {
    const objective = objectives[id];
    if (!objective.name) continue;

    const targetBox = document.createElement("div");
    const width = imgtag.clientWidth;
    const height = imgtag.clientHeight;

    targetBox.dataset.name = objective.name;

    targetBox.style.left = objective.left * width + "px";
    targetBox.style.top = objective.top * height + "px";
    targetBox.style.width = (objective.right - objective.left) * width + "px";
    targetBox.style.height = (objective.bottom - objective.top) * height + "px";

    targetBox.style.position = "absolute";
    targetBox.style.border = "2px solid red";
    targetBox.style.boxShadow = "0 0 5px lime, 0 0 5px lime inset";

    targetBox.style.animationName = "breath";
    targetBox.style.animationDuration = "2s";
    targetBox.style.animationTimingFunction = "ease-in-out";
    targetBox.style.animationIterationCount = "infinite";

    targetBox.classList.add("target-box");

    imageContainer.appendChild(targetBox);
  }
}

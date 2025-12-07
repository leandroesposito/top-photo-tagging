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
  const gameData = await api.getGameData(gameId);

  const objectivesContainer = document.querySelector(".objectives");
  objectivesContainer.innerHTML = "";
  for (const id in gameData.objectives) {
    const objective = gameData.objectives[id];
    const objectiveElement = createObjectiveElement(objective);
    objectivesContainer.appendChild(objectiveElement);
  }

  setImage(gameData.pictureFilename);
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
  // convert mouse position relative to the picture's dimensions
  // to a value in a scale between 0 and 1
  const normalizedPos = {
    x: event.offsetX / imgtag.clientWidth,
    y: event.offsetY / imgtag.clientHeight,
  };

  if (objective.top) {
    objective.right = normalizedPos.x;
    objective.bottom = normalizedPos.y;
    objective.name = prompt();
    console.log({ ...objective });
    objective.top = null;
  } else {
    objective.top = normalizedPos.y;
    objective.left = normalizedPos.x;
  }

  const markerSize = imgtag.offsetWidth * 0.02;
  marker.style.width = markerSize + "px";
  marker.style.height = markerSize + "px";
  marker.style.left = event.offsetX - markerSize / 2 + "px";
  marker.style.top = event.offsetY - markerSize / 2 + "px";
  marker.classList.remove("hidden");
}

function handleGameHover(event) {
  const target = event.target;

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

  imgtag.style.width = naturalWidth * scaleFactor + "px";
  imgtag.style.height = naturalHeight * scaleFactor + "px";

  marker.classList.add("hidden");
}

function scaleIn() {
  scaleFactor = Math.min(scaleFactor + 0.1, 2);
  updateZoom();
}

function scaleOut() {
  scaleFactor = Math.max(
    scaleFactor - 0.1,
    imageContainer.clientWidth / imgtag.naturalWidth
  );
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
let scaleFactor = 0.5;

imageContainer.addEventListener("wheel", handleGameHover);

imageContainer.addEventListener("click", handleGameClick);

imageContainer.addEventListener("mousemove", handleGameHover);

imageContainer.addEventListener("wheel", handleGameWheel);

await initSite();

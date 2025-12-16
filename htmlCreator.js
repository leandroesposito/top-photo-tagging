export default {
  createGameOption: function (game, clickHandler) {
    const gameOption = document.createElement("article");
    gameOption.classList.add("card");
    gameOption.classList.add("game-option");
    gameOption.dataset.id = game.id;
    gameOption.addEventListener("click", clickHandler);

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
  },

  createObjectiveElement: function (objective) {
    const objectiveElement = document.createElement("article");
    objectiveElement.classList.add("card");
    objectiveElement.classList.add("objective");
    objectiveElement.dataset.id = objective.id;

    const thumbnail = document.createElement("div");
    thumbnail.classList.add("thumbnail");

    const img = document.createElement("img");
    img.src = "./imgs/objectives/" + objective.picturefilename;
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
  },

  createObjectivesDropdown: function (objectives, clickHandler) {
    const container = document.createDocumentFragment();
    for (const id in objectives) {
      const objective = objectives[id];
      const objectiveButton = document.createElement("button");
      objectiveButton.textContent = objective.name;
      objectiveButton.classList.add("objective");
      objectiveButton.dataset.id = objective.id;
      container.appendChild(objectiveButton);
      objectiveButton.addEventListener("click", clickHandler);
    }

    return container;
  },

  createFlashMessage: function (message, type) {
    const div = document.createElement("div");
    div.textContent = message;
    div.classList.add("flash-message");
    div.classList.add(type);
    div.classList.add("hidden-message");

    function show() {
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

    return { element: div, show };
  },

  createObjectivesDisplay: function (objectives) {
    const container = document.createDocumentFragment();
    for (const id in objectives) {
      const objective = objectives[id];
      const objectiveElement = this.createObjectiveElement(objective);
      container.appendChild(objectiveElement);
    }
    return container;
  },

  createScoresDisplay: function (scores) {
    const container = document.createDocumentFragment();

    scores.forEach((score) => {
      const nameElement = document.createElement("div");
      nameElement.classList.add("name");
      nameElement.textContent = score.name;
      container.appendChild(nameElement);

      const timeElement = document.createElement("div");
      timeElement.classList.add("time");
      timeElement.textContent = score.time;
      container.appendChild(timeElement);
    });

    return container;
  },

  createTargetBox: function (contanerWidth, containerHeight, objective) {
    const targetBox = document.createElement("div");
    targetBox.dataset.name = objective.name;

    targetBox.style.left = objective.left * contanerWidth + "px";
    targetBox.style.top = objective.top * containerHeight + "px";
    targetBox.style.width =
      (objective.right - objective.left) * contanerWidth + "px";
    targetBox.style.height =
      (objective.bottom - objective.top) * containerHeight + "px";

    targetBox.classList.add("target-box");

    return targetBox;
  },
};

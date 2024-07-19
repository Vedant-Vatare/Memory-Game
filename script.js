import playersObject from "./player.js";
const startButton = document.querySelector("#start-btn");
const mainMenu = document.querySelector(".main-menu");
const game = document.querySelector(".game");
const navMenu = document.querySelector(".menu-bar");
const toggleMenuBtn = document.querySelector("#toggle-menu-bar");
const gameBoard = document.querySelector(".game-board");
const timer = document.querySelector("#time-elapsed");
const movesCounter = document.querySelector("#moves-count");
let isMultiplayer,
  chosenGridSize,
  chosenTheme,
  timeIntv,
  playingPlayersCount,
  moves = 0,
  totalFoundTiles = 0;
let selectedTiles = [],
  playingPlayers = [];

addSelectOptions();
function addSelectOptions() {
  let themeOptions = Array.from(
    document.querySelector(".theme-options").children
  );
  let playersOptions = Array.from(
    document.querySelector(".player-options").children
  );
  let gridOptions = Array.from(
    document.querySelector(".grid-options").children
  );
  themeOptions.forEach((element) => selectOptions(element));
  playersOptions.forEach((element) => selectOptions(element));
  gridOptions.forEach((element) => selectOptions(element));
}

function selectOptions(elem) {
  elem.addEventListener("click", (e) => {
    let getSiblings = Array.from(e.target.parentElement.children);
    getSiblings.forEach((sibling) => {
      if (sibling.hasAttribute("selected")) sibling.removeAttribute("selected");
    });
    e.target.setAttribute("selected", "");
  });
}

// Defining Event handlers on buttons:
const startGameFn = () => {
  mainMenu.classList.add("hidden");
  game.classList.remove("hidden");
  // manageTimer(true, Date.now());
  setupGameLayout();
};
function setupGameLayout() {
  debugger
  // getting input data:
  chosenTheme = document.querySelector(
    ".theme-options > [selected]"
  ).textContent;
  playingPlayersCount = Number(
    document.querySelector(".player-options > [selected]").textContent
  );
  chosenGridSize = Number(
    document.querySelector(".grid-options > [selected]").dataset.total
  );
  // setting tiles(No. of boxes)
  chosenGridSize == 16
    ? (gameBoard.dataset.tiles = 16)
    : (gameBoard.dataset.tiles = 36);
  createTiles(chosenTheme);
  playingPlayersCount == 1 ? (isMultiplayer = false) : (isMultiplayer = true);
  createPlayers();
  manageTimer(true, Date.now());
}

function createTiles() {
  let totalElements = [];
  addInArray(1, chosenGridSize / 2);
  function addInArray(start, end) {
    if (chosenTheme == "Numbers") {
      for (let i = start; i <= end; i++) {
        totalElements.push(i);
        totalElements.push(i);
      }
    } else {
      const imgPaths = [
        "./icons/house-solid.svg",
        "./icons/heart-solid.svg",
        "./icons/atom-solid.svg",
        "./icons/bell-solid.svg",
        "./icons/bomb-solid.svg",
        "./icons/bookmark-solid.svg",
        "./icons/brain-solid.svg",
        "./icons/bug-solid.svg",
        "./icons/car-rear-solid.svg",
        "./icons/cloud-solid.svg",
        "./icons/code-branch-solid.svg",
        "./icons/dice-six-solid.svg",
        "./icons/gem-regular.svg",
        "./icons/dragon-solid.svg",
        "./icons/fire-solid.svg",
        "./icons/globe-solid.svg",
        "./icons/mug-saucer-solid.svg",
        "./icons/meteor-solid.svg",
      ];
      for (let i = 0; i < end; i++) {
        totalElements.push(imgPaths[i]);
        totalElements.push(imgPaths[i]);
      }
    }
    totalElements.sort(() => Math.random() - 0.5);
  }
  totalElements.forEach((data) => {
    const wrapperElement = document.createElement("div");
    if (chosenTheme == "Numbers") {
      wrapperElement.textContent = data;
      gameBoard.appendChild(wrapperElement);
    } else {
      const img = document.createElement("img");
      img.src = data;
      wrapperElement.appendChild(img);
      gameBoard.appendChild(wrapperElement);
    }
    wrapperElement.addEventListener("click", (e) => {
      if (selectedTiles.length < 2) openTile(e.target);

      checkTiles(e.target);
    });
  });
}

function createPlayers() {
  const allPlayersList = Array.from(document.querySelectorAll(".player"));
  const timeElapsedTab = document.querySelector(".time-elapsed-tab");
  const movesCounterTab = document.querySelector(".moves-counter-tab");
  allPlayersList.forEach((player) => player.classList.add("hidden"));
  if (!isMultiplayer) {
    // show timer and moves for single player.
    timeElapsedTab.classList.remove("hidden");
    movesCounterTab.classList.remove("hidden");
    return;
  }
  // Adding players for multiplayer game mode :
  for (let i = 0; i < playingPlayersCount; i++) {
    allPlayersList[i].classList.remove("hidden");
    //concise indication of players for small devices
    if (window.innerWidth < 760) {
      allPlayersList[i].querySelector("p").textContent = `P${i + 1}`;
    }
    playingPlayers.push(new playersObject(allPlayersList[i]));
  }
  // hiding the timer and moves counter for multiplayer.
  timeElapsedTab.classList.add("hidden");
  movesCounterTab.classList.add("hidden");
  manageInitialTurns();
}

function manageInitialTurns() {
  playingPlayers[0].element.classList.add("active-player");
}

function updateTurns(currentPlayer) {
  currentPlayer.classList.remove("active-player");
  let nextPlayerIndex;
  playingPlayers.forEach((obj, index) => {
    if (obj.element == currentPlayer) {
      nextPlayerIndex = index + 1;
    }
  });
  if (playingPlayers.length == nextPlayerIndex) {
    playingPlayers[0].element.classList.add("active-player");
  } else {
    playingPlayers[nextPlayerIndex].element.classList.add("active-player");
  }
  console.log("next players turn !");
}

function manageTimer(playState, startTime) {
  // play timer only for single player:
  timer.textContent = "00 : 00";
  if (playState == true && playingPlayersCount == 1) {
    console.log("starting timer");
    timeIntv = setInterval(() => {
      updateTimer(startTime);
    }, 1000);
  } else {
    clearInterval(timeIntv);
  }
}

function updateTimer(startTime) {
  let diff = new Date() - startTime;
  let minutes = Math.floor(diff / 60000);
  diff = diff % 60000;
  let seconds = Math.floor(diff / 1000);
  minutes < 10 ? (minutes = "0" + minutes) : minutes;
  seconds < 10 ? (seconds = "0" + seconds) : seconds;
  timer.textContent = `${minutes} : ${seconds}`;
}

const restartFn = () => {
  clearInterval(timeIntv);
  manageTimer(true, Date.now());
  resetGame();
  createTiles(chosenTheme);
  // const restartButton = document.querySelector(".restart-btn");
  if (document.querySelector("dialog[open]") !== null) closeModalFn();
};

const newGameFn = () => {
  game.classList.add("hidden");
  mainMenu.classList.remove("hidden");
  manageTimer(false);
  // const newGameButton = document.querySelector(".new-game-btn");
  //find an open model and close it
  if (document.querySelector("dialog[open]") !== null) closeModalFn();
  resetGame();
};

const closeModalFn = () => {
  document.querySelector("dialog[open]").close();
};

let addEvent = (element, eventHandler) => {
  element.addEventListener("click", eventHandler);
};
class createButton {
  constructor(className, text, eventHandler) {
    this.element = document.createElement("button");
    this.element.classList.add(className);
    addEvent(this.element, eventHandler);
    this.element.textContent = text;
    return this.element;
  }
}
function appendButton(element, className, text, event) {
  element.append(new createButton(className, text, event));
}

setButtonControls();
function setButtonControls() {
  addEvent(startButton, startGameFn);
  // for bigger screen sizes:
  if (window.innerWidth > 760) {
    appendButton(navMenu, "restart-btn", "restart", restartFn);
    appendButton(navMenu, "new-game-btn", "New Game", newGameFn);
  } else {
    toggleMenuBtn.classList.remove("hidden");
    toggleMenuBtn.addEventListener("click", () => {
      game.querySelector("#menu-dialog").showModal();
    });
    createModalElement();
  }
}
function createModalElement() {
  const modalElement = document.createElement("dialog");
  game.appendChild(modalElement);
  modalElement.id = "menu-dialog";
  appendButton(modalElement, "restart-btn", "Restart", restartFn);
  appendButton(modalElement, "new-game-btn", "New Game", newGameFn);
  appendButton(modalElement, "resume-btn", "Resume Game", closeModalFn);
}

function incrementCounter(curentPlayer) {
  if (isMultiplayer) {
    //for multiplayer game:
    ++curentPlayer.querySelector(".moves-count").textContent;
  } else {
    movesCounter.textContent = ++moves;
  }
}
function openTile(div) {
  div.classList.add("open");
}
function closeTile(div) {
  div.classList.remove("open");
}
// Solve the bug of tapping on the same element.
function checkTiles(tile) {
  // checking all the wrong selections first.
  if (
    tile.classList.contains("found-tile") ||
    tile == selectedTiles[0] ||
    selectedTiles.length == 2
  )
    return;

  if (selectedTiles.length < 2) {
    selectedTiles.push(tile);
  }
  if (selectedTiles.length !== 2) return;
  // check the two tiles now:
  console.log("checking the tiles...");
  const currentPlayer = document.querySelector(".active-player");
  setTimeout(() => {
    if (!(selectedTiles[0].innerHTML === selectedTiles[1].innerHTML)) {
      selectedTiles.forEach(closeTile);
    } else {
      selectedTiles.forEach((tile) => {
        tile.classList.add("found-tile");
        //increment found pairs count for current player
        if (isMultiplayer) {
          const element =  playingPlayers.find(obj=> obj.element === currentPlayer);
          element.incremetPairsFound();
        }
        checkForWin();
      });
    }
    selectedTiles = [];
    incrementCounter(currentPlayer);
    updateTurns(currentPlayer);
  }, 1000);
}

function checkForWin() {
  ++totalFoundTiles;
  console.log("checking for wins");
  if (!(totalFoundTiles == chosenGridSize)) {
    return;
  } else {
    annouceResult();
  }
}

function annouceResult() {
  const resultsDialog = document.querySelector("#result-dialog .btns");
  appendButton(resultsDialog, "restart-btn", "Restart", restartFn);
  appendButton(resultsDialog, "new-game-btn", "Setup New Game", newGameFn);
  if (!isMultiplayer) {
    // shwoing the total  time and moves taken
    Array.from(document.querySelectorAll(".score")).forEach(e => e.classList.remove("hidden"))
    document.querySelector("#time-taken").textContent = timer.textContent;
    document.querySelector("#moves-taken").textContent = `${moves + 1} Moves`;
  } else {

  }
  document.querySelector("#result-dialog").showModal();
  clearInterval(timeIntv);
}

function resetGame() {
  gameBoard.innerHTML = null;
  selectedTiles = [];
  [movesCounter.innerHTML, moves, totalFoundTiles] = [0, 0, 0];
}

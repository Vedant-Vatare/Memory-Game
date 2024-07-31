import { Player, Bot } from "./player.js";
const startButton = document.querySelector("#start-btn");
const mainMenu = document.querySelector(".main-menu");
const game = document.querySelector(".game");
const navMenu = document.querySelector(".menu-bar");
const toggleMenuBtn = document.querySelector("#toggle-menu-bar");
const gameBoard = document.querySelector(".game-board");
const timer = document.querySelector("#time-elapsed");
const movesCounter = document.querySelector("#moves-count");
const playerStats = document.querySelector(".players-stats");
let isMultiplayerMode,
  chosenGridSize,
  chosenTheme,
  timeIntv,
  playingPlayersCount,
  botsPlayingCount,
  areBotsAllowed,
  moves = 0,
  totalFoundTiles = 0,
  selectedTiles = [],
  playingPlayers = [],
  botsMemory = [];
const BotsMemoryLimit = 4;
window.addEventListener("DOMContentLoaded", () => {
  addSelectOptions();
  const AllRestartBtns = document.querySelectorAll(".restart-btn");
  AllRestartBtns.forEach((btn) => btn.addEventListener("click", restartGameFn));
  const AllNewGameBtns = document.querySelectorAll(".new-game-btn");
  AllNewGameBtns.forEach((btn) => btn.addEventListener("click", newGameFn));
});
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
  let botOptions = Array.from(document.querySelector(".bot-options").children);
  themeOptions.forEach((element) => selectOptions(element));
  gridOptions.forEach((element) => selectOptions(element));
  playersOptions.forEach((element) => {
    selectOptions(element);
  });
  botOptions.forEach((element) => selectOptions(element));
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
  setupGameLayout();
};
function setupGameLayout() {
  // getting input data:
  chosenTheme = document.querySelector(
    ".theme-options > [selected]"
  ).textContent;
  playingPlayersCount = Number(
    document.querySelector(".player-options > [selected]").textContent
  );
  botsPlayingCount = Number(
    document.querySelector(".bot-options > [selected]").textContent
  );
  areBotsAllowed = botsPlayingCount !== 0 ? true : false;
  chosenGridSize = Number(
    document.querySelector(".grid-options > [selected]").dataset.total
  );

  // setting tiles(No. of boxes)
  if (playingPlayersCount + botsPlayingCount > 1) {
    isMultiplayerMode = true;
  } else {
    isMultiplayerMode = false;
  }
  createTiles(chosenTheme);
  populatePlayers();
  manageTimer(true, Date.now());
  console.log(playingPlayers);
}

function createTiles() {
  if (chosenGridSize == 16) gameBoard.dataset.tiles = 16;
  else gameBoard.dataset.tiles = 36;
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
        "<img src='meteor-solid.svg'/>",
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
      if (selectedTiles.length < 2) {
        openTile(e.target);
        checkTiles(e.target);
      }
    });
  });
}
const restartGameFn = () => {
  clearInterval(timeIntv);
  manageTimer(true, Date.now());
  resetGame();
  createTiles(chosenTheme);
  if (document.querySelector("dialog[open]") !== null) closeModalFn();
  firstPlayersTurn();
};

const newGameFn = () => {
  game.classList.add("hidden");
  mainMenu.classList.remove("hidden");
  manageTimer(false);
  // find an open model and close it
  if (document.querySelector("dialog[open]") !== null) closeModalFn();
  resetGame();
};

const closeModalFn = () => {
  document.querySelector("dialog[open]").close();
};

function addEvent(element, eventHandler) {
  element.addEventListener("click", eventHandler);
}

class Button {
  constructor(className, text) {
    this.element = document.createElement("button");
    this.element.classList.add(className);
    this.element.textContent = text;
  }
  getElement() {
    return this.element;
  }
}

function appendButton(element, className, text) {
  const button = new Button(className, text);
  element.append(button.getElement());
}

setButtonControls();
function setButtonControls() {
  addEvent(startButton, startGameFn);
  // for bigger screen sizes:
  if (window.innerWidth > 760) {
    appendButton(navMenu, "restart-btn", "restart");
    appendButton(navMenu, "new-game-btn", "New Game");
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
  appendButton(modalElement, "restart-btn", "Restart");
  appendButton(modalElement, "new-game-btn", "New Game");
  appendButton(modalElement, "resume-btn", "Resume Game");
  const resumeBtn = document.querySelector(".resume-btn");
  resumeBtn.addEventListener("click", closeModalFn);
}

function incrementCounterForPlayer(currentPlayer) {
  if (isMultiplayerMode) {
    //for multiplayer game:
    ++currentPlayer.querySelector(".moves-count").textContent;
  } else {
    movesCounter.textContent = ++moves;
  }
}
function openTile(div) {
  if (div) div.classList.add("open");
}
function closeTile(div) {
  if (div) div.classList.remove("open");
}

function populatePlayers() {
  playingPlayers = [];
  const allPlayersList = Array.from(document.querySelectorAll(".player"));
  const playersAreaElement = document.querySelector(".game-info");
  allPlayersList.forEach((player) => player.classList.add("hidden"));
  const timeElapsedTab = document.querySelector(".time-elapsed-tab");
  const movesCounterTab = document.querySelector(".moves-counter-tab");
  if (!isMultiplayerMode) {
    // show timer and moves for single player.
    timeElapsedTab.classList.remove("hidden");
    movesCounterTab.classList.remove("hidden");
    return;
  }
  timeElapsedTab.classList.add("hidden");
  movesCounterTab.classList.add("hidden");
  // Adding players for multiplayer game mode :
  for (let i = 0; i < playingPlayersCount; i++) {
    const player = createPlayer("Player", playingPlayers.length);
    playersAreaElement.appendChild(player);
  }
  firstPlayersTurn();
  if (!areBotsAllowed) return;
  for (let i = 0; i < botsPlayingCount; i++) {
    const botPlayer = createPlayer("Bot", playingPlayers.length, i + 1);
    playersAreaElement.appendChild(botPlayer);
  }
}

function firstPlayersTurn() {
  if (!isMultiplayerMode) return;
  const currentActive = document.querySelector(".game-info .active-player");
  currentActive?.classList.remove("active-player");
  playingPlayers[0].element.classList.add("active-player");
}

function createPlayer(playerType, playerNumber, botNumber = null) {
  const playerElement = document.createElement("span");
  const SpanElement = document.createElement("span");
  let prefix, playerObject;
  if (playerType == "Player") {
    playerObject = new Player(playerElement, playerNumber + 1);
    prefix = window.innerWidth > 760 ? "Player" : "P";
  } else {
    playerObject = new Bot(playerElement, playerNumber + 1, botNumber);
    prefix = window.innerWidth > 760 ? "Bot" : "B";
    playerElement.classList.add("bot-player");
  }
  playingPlayers.push(playerObject);
  playerElement.classList.add("player");
  SpanElement.classList.add("moves-count");
  SpanElement.textContent = 0;
  const text = `${prefix} ${playerNumber + 1}`;
  const paraElement = document.createElement("p");
  paraElement.textContent = text;
  playerElement.append(paraElement, SpanElement);
  return playerElement;
}

function nextPlayerTurn(currentPlayer) {
  currentPlayer.classList.remove("active-player");
  let nextPlayerIndex;
  playingPlayers.forEach((obj, index) => {
    if (obj.element == currentPlayer) {
      nextPlayerIndex = index + 1;
    }
  });
  if (playingPlayers.length == nextPlayerIndex) nextPlayerIndex = 0;
  playingPlayers[nextPlayerIndex].element.classList.add("active-player");
  if (playingPlayers[nextPlayerIndex].type == "Bot") MakeBotMove();
}

function manageTimer(playState, startTime) {
  // play timer only for single player:
  timer.textContent = "00 : 00";
  if (playState == true && playingPlayersCount == 1) {
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

function MakeBotMove() {
  // check for the same in memory.
  // if not, select random tile and again find for a match in memory.
  // if not found then select random tile
  
  let firstChosenTile, secondChosenTile;
  let memoryResponse = checkTilesInMemory();
  
  if (memoryResponse) {
    [firstChosenTile, secondChosenTile] = memoryResponse;
    console.log("got two same in memory")
  } else {
    console.log("has selected first randomly.")
    firstChosenTile = getRandomTileForBot(null);
    updatebotsMemory();
    
    memoryResponse = checkTilesInMemory();
    if (memoryResponse) {
      [firstChosenTile, secondChosenTile] = memoryResponse;
    } else {
      secondChosenTile = getRandomTileForBot(firstChosenTile);
      console.log("selected second randomly.")
    }
  }
  console.log(firstChosenTile, secondChosenTile);
  setTimeout(() => {
    chooseTileForBot(firstChosenTile);
    checkTilesInMemory();
  }, 1000);

  setTimeout(() => {
    chooseTileForBot(secondChosenTile);
  }, 2000);
}

function checkTilesInMemory() {
  // [1,2,3,5,2,6]
  let matchedTiles
   botsMemory.forEach((tile)=>{
    botsMemory.forEach((nestedTile)=>{
      if (tile.isEqualNode(nestedTile) && !(tile.isSameNode(nestedTile))) {
        console.log("got the tiles.")
        matchedTiles = [tile, nestedTile]
      }
    })
  })
  console.log(matchedTiles)
  return matchedTiles;
}

function chooseTileForBot(tile) {
  openTile(tile);
  checkTiles(tile);
}

function getRandomTileForBot(lastTile) {
  const totalTiles = Array.from(gameBoard.children);
  const availableTiles = totalTiles.filter(tile=> !tile.classList.contains("found-tile"))

  if (availableTiles < 1) return;
  const tile =
    availableTiles[Math.floor(Math.random() * availableTiles.length)];
  if (tile === lastTile) {
    return getRandomTileForBot(availableTiles, tile);
  } else {
    return tile;
  }
}

function updatebotsMemory(tilesState) {
  if (tilesState == "delete") {
    selectedTiles.forEach((tile) => {
      const tileIndex = botsMemory.indexOf(tile);

      if (tileIndex !== -1) botsMemory.splice(tileIndex, 1);
    });
    return;
  }
  // Adding tiles to memory of bots.
  if(botsMemory.length > BotsMemoryLimit) {
    // remove the memory of oldest remembered tile.
    botsMemory.shift();
  }
  selectedTiles.forEach((tile) => {
    if (!botsMemory.includes(tile)) {
      botsMemory.push(tile);
    }
  });
}

function checkTiles(tile) {
  // console.log("checking tile", selectedTiles)
  if (
    tile === undefined ||
    tile.classList.contains("found-tile") ||
    tile == selectedTiles[0] ||
    selectedTiles.length == 2
  ) {
    console.log("selected tiles are same");
    return;
  }

  if (selectedTiles.length < 2) {
    selectedTiles.push(tile);
  }
  if (selectedTiles.length !== 2) return;
  // check the two tiles now:
  const currentPlayer = document.querySelector(".active-player");
  setTimeout(() => {
    if (!(selectedTiles[0].isEqualNode(selectedTiles[1]))) {

      selectedTiles.forEach(closeTile);
      // Remember the revealed tiles tiles.
      if (areBotsAllowed) updatebotsMemory("revealed");
      selectedTiles = [];
      if (isMultiplayerMode) {
        nextPlayerTurn(currentPlayer);
      }
      return;
    }
    // tiles are matched.
    incrementCounterForPlayer(currentPlayer);
    selectedTiles.forEach((tile) => tile.classList.add("found-tile"));
    let elementIndex;
    if (isMultiplayerMode) {
      elementIndex = playingPlayers.findIndex(
        (obj) => obj.element === currentPlayer
      );
      playingPlayers[elementIndex].incremetPairsFound();
      // delete the memory of tile for bots as they are found now.
      if (areBotsAllowed) updatebotsMemory("delete");
      selectedTiles = [];
      if (playingPlayers[elementIndex].type == "Bot") {
        console.log("extra chance!");
        MakeBotMove();
      }
    }
    // debugger;
    checkForWin();
  }, 1000);
}

function checkForWin() {
  console.log("checking for win.");
  totalFoundTiles += 2;
  // console.log("checking for win")
  if (!(totalFoundTiles == chosenGridSize)) {
    return;
  } else {
    annouceResult();
  }
}
function annouceResult() {
  clearInterval(timeIntv);
  let modal;
  if (isMultiplayerMode) {
    modal = document.querySelector(".multiplayer-result");
    populateWinnerModal(modal);
    modal.showModal();
  } else {
    modal = document.querySelector(".singleplayer-result");
    modal.showModal();
    //showing the total time and moves taken
    Array.from(document.querySelectorAll(".score")).forEach((e) =>
      e.classList.remove("hidden")
    );
    document.querySelector("#time-taken").textContent = timer.textContent;
    document.querySelector("#moves-taken").textContent = `${moves + 1} Moves`;
  }
}

function populateWinnerModal(modal) {
  playingPlayers.sort((a, b) => {
    if (a > b) return 1;
    else return -1;
  });
  // arranging based on Number of pairs found (greater -> smaller)
  playingPlayers.sort((element1, element2) => {
    if (element1.pairsFound > element2.pairsFound) return -1;
    else return 1;
  });
  const playerWon = playingPlayers[0];
  modal.querySelector(
    "h2"
  ).textContent = `${playerWon.type} ${playerWon.playerNumber} Wins!`;

  playingPlayers.forEach((player, index) => {
    const wrapperElement = document.createElement("div");
    const span = document.createElement("span");
    const para = document.createElement("p");
    span.textContent = `${player.type} ${player.playerNumber}`;
    if (index == 0)
      span.textContent = `${player.type} ${player.playerNumber} (Winner)`;
    const pairsType = player.pairsFound > 1 ? "Pairs" : "Pair";
    para.textContent = `${player.pairsFound}  ${pairsType}`;
    wrapperElement.append(span, para);
    playerStats.appendChild(wrapperElement);
  });
  debugger;
}

function resetGame() {
  gameBoard.innerHTML = null;
  selectedTiles = [];
  [movesCounter.innerHTML, moves, totalFoundTiles] = [0, 0, 0];

  // resetting the moves and pairs count of players
  if (isMultiplayerMode) {
    playerStats.innerHTML = null;
    playingPlayers.forEach((player) => {
      player.element.querySelector(".moves-count").textContent = 0;
      player.movesCount = 0;
      player.pairsFound = 0;
    });
  }
}

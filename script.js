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
const teamGameInfo = document.querySelector(".team-game-info");
// const modesTabContainer = document.querySelector(".game-mode-options")

let isMultiplayerMode,
  chosenGridSize,
  chosenTheme,
  chosenGameMode,
  timeIntv,
  playingPlayersCount,
  botsPlayingCount,
  areBotsAllowed,
  moves = 0,
  totalFoundTiles = 0,
  selectedTiles = [],
  playingPlayers = [];
const BotsMemoryLimit = 6;

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
  let gameModeOptions = Array.from(
    document.querySelector(".tabs-menu").children
  );
  themeOptions.forEach((element) => selectOptions(element));

  gridOptions.forEach((element) => selectOptions(element));

  playersOptions.forEach((element) => {
    selectOptions(element);
  });
  botOptions.forEach((element) => selectOptions(element));

  gameModeOptions.forEach((gameModeElement) => {
    selectOptions(gameModeElement);
    gameModeElement.addEventListener("click", (event) => {
      chosenGameMode = event.target.dataset.mode;
      const teamOptions = document.querySelector(".teams-game-options");
      if (chosenGameMode == "teams") {
        teamOptions.classList.remove("hidden");
      } else {
        teamOptions.classList.add("hidden");
      }
    });
  });
}

function selectOptions(elem) {
  elem.addEventListener("click", (e) => {
    const previousSelected = elem.parentElement.querySelector("[selected]");
    if (previousSelected) previousSelected.removeAttribute("selected");
    e.target.setAttribute("selected", "");
  });
}

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
  chosenGridSize = Number(
    document.querySelector(".grid-options > [selected]").dataset.total
  );

  setGameMode();
  isMultiplayerMode = playingPlayersCount + botsPlayingCount > 1;
  createTiles(chosenTheme);
  populatePlayers();

  if (isMultiplayerMode) {
    firstPlayersTurn();
    manageTimer(false);
  } else {
    manageTimer(true, Date.now());
  }
}
function setGameMode() {
  if (chosenGameMode == "teams") {
    botsPlayingCount = playingPlayersCount;
    areBotsAllowed = true;
    teamGameInfo.classList.remove("hidden");
  } else {
    botsPlayingCount = Number(
      document.querySelector(".bot-options > [selected]").textContent
    );
    areBotsAllowed = botsPlayingCount !== 0;
    teamGameInfo.classList.add("hidden");
    console.log("classic");
  }
}
function createTiles() {
  let totalElements = getTileElements();
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
function getTileElements() {
  if (chosenGridSize == 16) gameBoard.dataset.tiles = 16;
  else gameBoard.dataset.tiles = 36;
  const totalElements = [];
  const end = chosenGridSize / 2;

  if (chosenTheme === "Numbers") {
    for (let i = 1; i <= end; i++) {
      totalElements.push(i, i);
    }
  } else {
    const imgPaths = [
      "./assets/icons/house-solid.svg",
      "./assets/icons/heart-solid.svg",
      "./assets/icons/atom-solid.svg",
      "./assets/icons/bell-solid.svg",
      "./assets/icons/bomb-solid.svg",
      "./assets/icons/bookmark-solid.svg",
      "./assets/icons/brain-solid.svg",
      "./assets/icons/bug-solid.svg",
      "./assets/icons/car-rear-solid.svg",
      "./assets/icons/cloud-solid.svg",
      "./assets/icons/dice-six-solid.svg",
      "./assets/icons/code-branch-solid.svg",
      "./assets/icons/gem-regular.svg",
      "./assets/icons/dragon-solid.svg",
      "./assets/icons/fire-solid.svg",
      "./assets/icons/globe-solid.svg",
      "./assets/icons/mug-saucer-solid.svg",
      "./assets/icons/meteor-solid.svg",
    ];

    for (let i = 0; i < end; i++) {
      totalElements.push(imgPaths[i], imgPaths[i]);
    }
  }

  return totalElements.sort(() => Math.random() - 0.5);
}
const restartGameFn = () => {
  resetGame();
  if (document.querySelector("dialog[open]") !== null) closeModalFn();
  createTiles(chosenTheme);
  populatePlayers();
  if (isMultiplayerMode) {
    firstPlayersTurn();
    manageTimer(false);
  } else {
    manageTimer(true, Date.now());
  }
};

const newGameFn = () => {
  // find an open model and close it
  if (document.querySelector("dialog[open]") !== null) closeModalFn();
  game.classList.add("hidden");
  mainMenu.classList.remove("hidden");
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

function incrementCounterForPlayer(playerObject) {
  if (isMultiplayerMode) {
    //for multiplayer game:
    playerObject.incremetPairsFound();
    ++playerObject.element.querySelector(".moves-count").textContent;
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

function nextPlayerTurn(currentPlayerObject) {
  currentPlayerObject.element.classList.remove("active-player");
  let nextPlayerIndex = playingPlayers.indexOf(currentPlayerObject) + 1;

  if (playingPlayers.length == nextPlayerIndex) nextPlayerIndex = 0;
  const nextPlayerObject = playingPlayers[nextPlayerIndex];

  nextPlayerObject.element.classList.add("active-player");

  if (nextPlayerObject.type == "Bot") MakeBotMove(nextPlayerObject);
}

function manageTimer(playState, startTime) {
  // play timer only for single player:
  timer.textContent = "00 : 00";
  if (playState == true && playingPlayersCount == 1) {
    timeIntv = setInterval(() => {
      updateTimer(startTime);
    }, 1000);
  } else {
    if (timeIntv) clearInterval(timeIntv);
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

function MakeBotMove(bot) {
  let firstChosenTile, secondChosenTile;
  let memoryResponse = checkTilesInMemory(bot);
  if (memoryResponse) {
    [firstChosenTile, secondChosenTile] = memoryResponse;
  } else {
    firstChosenTile = getRandomTileForBot(null);
    updatebotsMemory(bot);
    memoryResponse = checkTilesInMemory(bot);
    if (memoryResponse) {
      [firstChosenTile, secondChosenTile] = memoryResponse;
    } else {
      secondChosenTile = getRandomTileForBot(firstChosenTile);
    }
  }
  setTimeout(() => {
    chooseTileForBot(firstChosenTile);
    checkTilesInMemory(bot);
  }, 500);

  setTimeout(() => {
    chooseTileForBot(secondChosenTile);
  }, 1000);
}

function checkTilesInMemory(bot) {
  let matchedTiles = null;
  bot.memorisedTiles.forEach((tile) => {
    bot.memorisedTiles.forEach((anotherTile) => {
      // find the equal element (duplicates in bot memory).
      if (tile.isEqualNode(anotherTile) && !tile.isSameNode(anotherTile)) {
        matchedTiles = [tile, anotherTile];
      }
    });
  });
  return matchedTiles;
}

function chooseTileForBot(tile) {
  openTile(tile);
  checkTiles(tile);
}

function getRandomTileForBot(lastTile) {
  const totalTiles = Array.from(gameBoard.children);
  const availableTiles = totalTiles.filter((tile) => {
    return !tile.classList.contains("found-tile") && tile !== lastTile;
  });

  if (availableTiles.length < 1) return null;

  const randomTile =
    availableTiles[Math.floor(Math.random() * availableTiles.length)];
  return randomTile;
}

function updatebotsMemory(tilesState) {
  const allBotPlayers = playingPlayers.filter((player) => player.type == "Bot");
  if (tilesState == "delete") {
    allBotPlayers.forEach((bot) => {
      selectedTiles.forEach((tile) => {
        const tileIndex = bot.memorisedTiles.indexOf(tile);

        if (tileIndex !== -1) bot.memorisedTiles.splice(tileIndex, 1);
      });
    });
    return;
  }
  // Adding tiles to memory of bots.
  allBotPlayers.forEach((bot) => {
    selectedTiles.forEach((tile) => {
      if (!bot.memorisedTiles.includes(tile)) {
        bot.memorisedTiles.push(tile);
      }
    });
  });

  // remove the memory of random remembered tile.
  allBotPlayers.forEach((bot) => {
    if (bot.memorisedTiles.length > BotsMemoryLimit) {
      const index = Math.floor(Math.random() * bot.memorisedTiles.length);
      bot.memorisedTiles.splice(index, 1);
    }
  });
}

function checkTiles(tile) {
  if (validateTile(tile)) {
    selectedTiles.push(tile);
  }

  if (selectedTiles.length === 2) {
    processSelectedTiles();
  }
}

function validateTile(tile) {
  return !(
    tile === undefined ||
    tile.classList.contains("found-tile") ||
    tile === selectedTiles[0] ||
    selectedTiles.length === 2
  );
}

function processSelectedTiles() {
  if (selectedTiles.length < 2) return;
  const currentPlayer = document.querySelector(".active-player");
  setTimeout(() => {
    const currentPlayerObject = playingPlayers.find(
      (obj) => obj.element === currentPlayer
    );
    if (selectedTiles[0].isEqualNode(selectedTiles[1])) {
      handleTileMatch(currentPlayerObject);
    } else {
      handleTileMismatch(currentPlayerObject);
    }
  }, 750);
}

function handleTileMatch(playerObject) {
  selectedTiles.forEach((tile) => tile.classList.add("found-tile"));
  incrementCounterForPlayer(playerObject);

  const isWon = checkForGameOver();
  if (isWon) {
    displayGameResult();
    return;
  }

  if (isMultiplayerMode) {
    if (areBotsAllowed) updatebotsMemory("delete");
    selectedTiles = [];
    if (playerObject.type === "Bot") {
      MakeBotMove(playerObject);
    }
  } else {
    selectedTiles = [];
  }
}

function handleTileMismatch(playerObject) {
  selectedTiles.forEach(closeTile);
  if (areBotsAllowed) updatebotsMemory("revealed");
  selectedTiles = [];

  if (isMultiplayerMode) {
    nextPlayerTurn(playerObject);
  }
}

function checkForGameOver() {
  totalFoundTiles += 2;
  return totalFoundTiles == chosenGridSize;
}
function displayGameResult() {
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
function updatePlayersStats() {
  playingPlayers.sort((p1, p2) => {
    if (p1.pairsFound > p2.pairsFound) return -1;
    return 1;
  });
  const winner = playingPlayers[0];
  const isDraw = playingPlayers.some(
    (player, index) => player.pairsFound === winner.pairsFound && index !== 0
  );
  return isDraw;
}
function populateWinnerModal(modal) {
  const isDraw = updatePlayersStats();
  if (isDraw) {
    modal.querySelector("h2").textContent = `Its a tie!`;
  } else {
    modal.querySelector(
      "h2"
    ).textContent = `${playingPlayers[0].type} ${playingPlayers[0].playerNumber} Wins!`;
  }

  playingPlayers.forEach((player, index) => {
    const wrapperElement = document.createElement("div");
    const span = document.createElement("span");
    const para = document.createElement("p");
    span.textContent = `${player.type} ${player.playerNumber}`;
    if (index == 0 && !isDraw)
      span.textContent = `${player.type} ${player.playerNumber} (Winner)`;
    const pairsType = player.pairsFound > 1 ? "Pairs" : "Pair";
    para.textContent = `${player.pairsFound}  ${pairsType}`;
    wrapperElement.append(span, para);
    playerStats.appendChild(wrapperElement);
  });
}

function resetGame() {
  manageTimer(false);
  // reset game variables.
  gameBoard.innerHTML = null;
  selectedTiles = [];
  [movesCounter.innerHTML, moves, totalFoundTiles] = [0, 0, 0];
  if (isMultiplayerMode) resetPlayersData();
}
function resetPlayersData() {
  playingPlayers.forEach((player) => {
    player.element.remove();
    player.element.querySelector(".moves-count").textContent = 0;
    player.movesCount = 0;
    player.pairsFound = 0;
    if (player.type == "Bot") player.memorisedTiles = [];
  });
  playerStats.innerHTML = null;
}

export class Player {
  constructor(element, playerNumber) {
    this.element = element;
    this.pairsFound = 0;
    this.playerNumber = playerNumber;
    this.type = "Player";
  }
  incremetPairsFound() {
    this.pairsFound++;
  }
}

export class Bot extends Player {
  constructor(element, playerNumber, botNumber) {
    super(element, playerNumber);
    this.botNumber = botNumber;
    this.type = "Bot";
  }
  makeMove() {
    console.log(this.element, "bot is making a move.");
  }
}
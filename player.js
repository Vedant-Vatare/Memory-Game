export  class Player {
  constructor(element, playerNumber){
    this.element = element;
    this.pairsFound = 0;
    this.playerNumber = playerNumber;
    this.type = "player"
  };
  incremetPairsFound() {
    this.pairsFound++;
  };
}

export class Bot extends Player {
  constructor(element, playerNumber) {
    super(element, playerNumber)
    this.type = "bot"
  }
  makeMove() {
    console.log(this.element, "bot is making a move.");
  }
 }
export default class playerDetails {
  constructor(element, playerNumber){
    this.element = element;
    this.pairsFound = 0;
    this.playerNumber = playerNumber;
  };
  incremetPairsFound() {
    this.pairsFound++;
  };
}
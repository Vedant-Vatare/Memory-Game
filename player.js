export default class playerDetails {
  constructor(element){
    this.element = element;
    this.movesCount = 0;
    this.pairsFound = 0;
  };
  getMovesCount() {
    return this.movesCount;
  };
  incremetCounter() {
    this.movesCount++;
  };
  incremetPairsFound() {
    this.pairsFound++;
  };
}
// in the diff-way branch change.
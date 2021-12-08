var idCount = 0;
class PieceObject {
  constructor(spec) {
    this.id = spec.id == undefined ? 'id' + idCount++ : spec.id;
    this.state = spec.state == undefined ? 'off' : spec.state;
    this.originalState = spec.originalState == undefined ? 'off' : spec.originalState;
    this.locked = spec.locked == undefined ? true : spec.locked;
    this.sullied = spec.sullied == undefined ? false : spec.sullied;
  }
}

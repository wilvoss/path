var idCount = 0;
class PieceObject {
  constructor(spec) {
    this.id = spec.id == undefined ? 'id' + idCount++ : spec.id;
    this.state = spec.state == undefined ? 'off' : spec.state;
    this.originalState = spec.originalState == undefined ? 'off' : spec.originalState;
    this.locked = spec.locked == undefined ? true : spec.locked;
    this.sullied = spec.sullied == undefined ? false : spec.sullied;
    this.t = spec.t == undefined ? false : spec.t;
    this.r = spec.r == undefined ? false : spec.r;
    this.b = spec.b == undefined ? false : spec.b;
    this.l = spec.l == undefined ? false : spec.l;
  }
}

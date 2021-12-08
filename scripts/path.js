/// <reference path="../helpers/console-enhancer.js" />
/// <reference path="../models/PieceObject.js" />

// if (!UseDebug) {
Vue.config.devtools = false;
Vue.config.debug = false;
Vue.config.silent = true;
// }

Vue.config.ignoredElements = ['app', 'page', 'navbar', 'settings', 'splash', 'splashwrap', 'message', 'notifications', 'speedControls', 'state', 'bank', 'commodity', 'detail', 'gameover', 'listheader', 'listings', 'category', 'name', 'units', 'currentPrice', 'description', 'market', 'currentValue', 'contractSize', 'goldbacking', 'contractUnit'];

var app = new Vue({
  el: '#app',
  data: {
    gameOver: false,
    maxBoardSize: 460,
    pieceStates: ['off', 'vertical', 'horizontal'],
    loadingSolution: false,
    pieces: [],
    timer: 0,
    showHome: true,
    showInstructions: true,
    showHowTo: false,
    numberOfClears: 0,
    nope: false,
    numberOfSullied: 0,
    currentMisses: 0,
    divider: 21,
    showGrid: false,
    savedState: [],
    statePurgatory: [],
    totalMoves: 0,
    r: document.querySelector(':root'),
    // modes: Modes,
    // currentMode: Modes[1],
  },
  methods: {
    NewGame(useState = false) {
      this.NewBoard(useState);
      this.gameOver = false;
    },
    CheckBoard() {
      this.numberOfSullied = 0;
      this.pieces.forEach((piece) => {
        if (piece.sullied) {
          this.numberOfSullied++;
        }
      });
      this.nope = false;
      this.CheckPath();
    },
    CheckPath() {
      if (this.pieces.length == this.divider * this.divider)
        for (let x = 0; x < this.pieces.length; x++) {
          const piece = this.pieces[x];
          // add all open horizontal paths
          if (x < this.divider) {
            piece.t = piece.state != 'vertical';
          } else {
            piece.t = piece.state != 'vertical' && this.pieces[x - this.divider].state != 'vertical';
          }
          if (x >= this.pieces.length - this.divider) {
            piece.b = piece.state != 'vertical';
          }
          // add all open vertical paths
          if (x % this.divider == 0) {
            piece.l = piece.state != 'horizontal';
          } else {
            piece.l = piece.state != 'horizontal' && this.pieces[x - 1].state != 'horizontal';
          }
          if ((x + 1) % this.divider == 0) {
            piece.r = piece.state != 'horizontal';
          }
        }
      this.RemoveDeadEndPaths();
    },
    RemoveDeadEndPaths() {
      let nw = new PieceObject({});
      let n = new PieceObject({});
      let ne = new PieceObject({});
      let w = new PieceObject({});
      let e = new PieceObject({});
      let sw = new PieceObject({});
      let s = new PieceObject({});
      let se = new PieceObject({});

      let count = -1;
      while (count != 0) {
        let tempcount = 0;
        for (let x = 1; x < this.pieces.length - 1; x++) {
          const piece = this.pieces[x];
          // find neighbors
          if (x - this.divider - 1 >= 0) nw = this.pieces[x - this.divider - 1];
          if (x - this.divider >= 0) n = this.pieces[x - this.divider];
          if (x - this.divider + 1 >= 0) ne = this.pieces[x - this.divider + 1];
          if (x - 1 > 0) w = this.pieces[x - 1];
          if (x + 1 < this.pieces.length - 1) e = this.pieces[x + 1];
          if (x + this.divider - 1 < this.pieces.length - 1) sw = this.pieces[x + this.divider - 1];
          if (x + this.divider < this.pieces.length) s = this.pieces[x + this.divider];
          if (x + this.divider + 1 < this.pieces.length) se = this.pieces[x + this.divider + 1];

          // remove top paths from disconnected surfaces
          if (piece.t && x < this.divider && ((!w.t && !piece.l) || (!e.t && !e.l))) {
            piece.t = false;
            tempcount++;
          } else if (piece.t && x >= this.divider && ((!w.t && !piece.l && !n.l) || (!e.t && !e.l && !ne.l))) {
            piece.t = false;
            tempcount++;
          }
          //remove bottom paths from disconnected surfaces
          if (piece.b && x != this.pieces.length - 1 && ((!piece.l && !w.b) || (!e.l && !e.b))) {
            piece.b = false;
            tempcount++;
          }
          // remove left paths from disconnected surfaces
          if (piece.l && x % this.divider == 0 && ((!piece.t && !n.l) || (!s.t && !s.l))) {
            piece.l = false;
            tempcount++;
          } else if (piece.l && x % this.divider != 0 && ((!w.t && !piece.t && !n.l) || (!sw.t && !s.t && !s.l))) {
            piece.l = false;
            tempcount++;
          }
          // remove right paths from disconnected surfaces
          if (piece.r && x != this.pieces.length - 1 && ((!piece.t && !n.r) || (!s.t && !s.r))) {
            piece.r = false;
            tempcount++;
          }
          count = tempcount;
        }
      }
    },
    SaveBoard(solution = false) {
      var pieceData = [];
      this.pieces.forEach((piece) => {
        state = piece.state == 'off' ? '' : piece.state == 'vertical' ? 'v' : 'h';
        state = state + (piece.sullied ? 's' : '');
        pieceData.push(state);
      });
      this.savedState = pieceData;
    },
    NewBoard(useState = false) {
      idCount = 0;
      this.totalMoves = 0;
      var size = (document.body.clientWidth - 40) / this.divider;
      this.r.style.setProperty('--pieceSize', size + 'px');
      this.r.style.setProperty('--gridSize', this.divider);
      this.pieces = [];
      this.currentMisses = 0;
      for (let x = 0; x < this.divider * this.divider; x++) {
        let state = '';
        let originalState = null;
        let sullied = false;
        if (useState && this.savedState != undefined && this.savedState[x] != undefined) {
          state = this.savedState[x].substring(0, 1);

          if (this.savedState[x].length > 1) {
            this.totalMoves++;
            if (this.loadingSolution) {
              sullied = true;
              originalState = state == 'v' ? 'horizontal' : 'vertical';
            } else {
              state = state == 'v' ? 'h' : 'v';
              originalState = state == 'v' ? 'vertical' : 'horizontal';
            }
          }
        }
        let piece = new PieceObject({
          state: useState ? (state == '' ? 'off' : state == 'v' ? 'vertical' : 'horizontal') : this.pieceStates[getRandomInt(0, this.pieceStates.length)],
          sullied: sullied,
        });
        piece.originalState = originalState == null ? piece.state : originalState;
        this.pieces.push(piece);
      }
      this.CheckBoard();
    },
    ResetBoard() {
      this.pieces.forEach((piece) => {
        piece.state = piece.originalState;
        piece.sullied = false;
      });
      this.CheckBoard();
    },
    TogglePieceSelection(piece) {
      if (piece.state != 'off') {
        piece.state = piece.state == 'vertical' ? 'horizontal' : 'vertical';
        piece.sullied = piece.originalState != piece.state;
      }
      this.CheckBoard();
    },
    SharePuzzle() {
      this.SaveBoard();
      navigator.share({
        title: 'Path',
        text: "Here's a puzzle I'm working on.",
        url: 'https://' + location.host + location.pathname + '?board=' + this.divider + '&walls=' + this.savedState.toString(),
      });
    },
    ShareSolution() {
      this.SaveBoard();
      navigator.share({
        title: 'Path',
        text: "Here's a puzzle I've solved.",
        url: 'https://' + location.host + location.pathname + '?solution=' + this.divider + '&walls=' + this.savedState.toString(),
      });
    },
    RestartGame() {
      this.timer = 0;
      this.numberOfFails = 0;
      this.numberOfClears = 0;
      this.showHome = false;
      this.NewGame();
    },
    SelectMode(piece) {
      // localStorage.setItem('mode', piece.name);
    },
    UpdateApp() {
      if (!this.gameOver) {
      }
    },
    MsToTime(s) {
      var ms = s % 1000;
      s = (s - ms) / 1000;
      var secs = s % 60;
      s = (s - secs) / 60;
      var mins = s % 60;
      var hrs = (s - mins) / 60;

      var secstring = mins != 0 || hrs != 0 ? ('0' + secs).slice(-2) : secs;
      var minstring = mins != 0 ? mins + '∶' : '';
      var hrsstring = hrs != 0 ? hrs + '∶' : '';
      return hrsstring + minstring + secstring;
    },
    EndGame() {
      let confirm = window.confirm('Are you sure you want to quit?');
      if (confirm) {
        this.gameOver = true;
      }
    },
    GetSettings() {
      const params = new URLSearchParams(window.location.search);
      this.loadingSolution = false;
      if (params.has('board')) {
        this.divider = Number(params.get('board'));
      }
      if (params.has('solution')) {
        this.divider = Number(params.get('solution'));
        this.loadingSolution = true;
      }
      if (params.has('walls')) {
        this.savedState = params.get('walls').split(',');
      } else {
        this.savedState = window.location.search.split(',');
      }
      // if (this.savedState.length == this.divider * this.divider) {
      //   this.NewBoard(true);
      // }
    },
    Resize() {
      var size = (document.body.clientWidth - 40) / this.divider;
      this.r.style.setProperty('--pieceSize', size + 'px');
      this.r.style.setProperty('--gridSize', this.divider);
    },
  },

  mounted() {
    this.GetSettings();
    if (this.savedState != null) {
      this.NewGame(this.savedState.length == this.divider * this.divider);
    } else {
      this.NewGame();
    }
    // this.ReadyStage();
    window.addEventListener('resize', this.Resize);
    this.updateInterval = window.setInterval(this.UpdateApp, 100);
  },

  computed: {},
});

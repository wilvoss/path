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
    showGrid: true,
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
    },
    SaveBoard(solution = false) {
      // this.statePurgatory = [];
      // this.pieces.forEach((piece) => {
      //   this.statePurgatory.push(new PieceObject(piece));
      // });
      // this.ResetBoard();
      var pieceData = [];
      this.pieces.forEach((piece) => {
        state = piece.state == 'off' ? '' : piece.state == 'vertical' ? 'v' : 'h';
        state = state + (piece.sullied ? 's' : '');
        pieceData.push(state);
      });
      this.savedState = pieceData;
      // this.pieces = this.statePurgatory;
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
        this.CheckBoard();
      }
    },
    ResetBoard() {
      this.pieces.forEach((piece) => {
        piece.state = piece.originalState;
        piece.sullied = false;
      });
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

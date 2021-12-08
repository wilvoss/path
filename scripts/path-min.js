Vue.config.devtools=!1,Vue.config.debug=!1,Vue.config.silent=!0,Vue.config.ignoredElements=["app","page","navbar","settings","splash","splashwrap","message","notifications","speedControls","state","bank","commodity","detail","gameover","listheader","listings","category","name","units","currentPrice","description","market","currentValue","contractSize","goldbacking","contractUnit"];var app=new Vue({el:"#app",data:{gameOver:!1,maxBoardSize:460,pieceStates:["off","vertical","horizontal"],loadingSolution:!1,pieces:[],timer:0,showHome:!0,showInstructions:!0,showHowTo:!1,numberOfClears:0,nope:!1,numberOfSullied:0,currentMisses:0,divider:21,showGrid:!1,savedState:[],statePurgatory:[],totalMoves:0,r:document.querySelector(":root")},methods:{NewGame(e=!1){this.NewBoard(e),this.gameOver=!1},CheckBoard(){this.numberOfSullied=0,this.pieces.forEach((e=>{e.sullied&&this.numberOfSullied++})),this.nope=!1,this.CheckPath()},CheckPath(){if(this.pieces.length==this.divider*this.divider)for(let e=0;e<this.pieces.length;e++){const t=this.pieces[e];e<this.divider?t.t="vertical"!=t.state:t.t="vertical"!=t.state&&"vertical"!=this.pieces[e-this.divider].state,e>=this.pieces.length-this.divider&&(t.b="vertical"!=t.state),e%this.divider==0?t.l="horizontal"!=t.state:t.l="horizontal"!=t.state&&"horizontal"!=this.pieces[e-1].state,(e+1)%this.divider==0&&(t.r="horizontal"!=t.state)}this.RemoveDeadEndPaths()},RemoveDeadEndPaths(){let e=new PieceObject({}),t=new PieceObject({}),i=new PieceObject({}),s=new PieceObject({}),a=new PieceObject({}),h=new PieceObject({}),r=new PieceObject({}),o=new PieceObject({}),l=-1;for(;0!=l;){let d=0;for(let n=1;n<this.pieces.length-1;n++){const c=this.pieces[n];n-this.divider-1>=0&&(e=this.pieces[n-this.divider-1]),n-this.divider>=0&&(t=this.pieces[n-this.divider]),n-this.divider+1>=0&&(i=this.pieces[n-this.divider+1]),n-1>0&&(s=this.pieces[n-1]),n+1<this.pieces.length-1&&(a=this.pieces[n+1]),n+this.divider-1<this.pieces.length-1&&(h=this.pieces[n+this.divider-1]),n+this.divider<this.pieces.length&&(r=this.pieces[n+this.divider]),n+this.divider+1<this.pieces.length&&(o=this.pieces[n+this.divider+1]),c.t&&n<this.divider&&(!s.t&&!c.l||!a.t&&!a.l)?(c.t=!1,d++):!(c.t&&n>=this.divider)||(s.t||c.l||t.l)&&(a.t||a.l||i.l)||(c.t=!1,d++),!c.b||n==this.pieces.length-1||(c.l||s.b)&&(a.l||a.b)||(c.b=!1,d++),(!c.l||n%this.divider!=0||(c.t||t.l)&&(r.t||r.l))&&(!c.l||n%this.divider==0||(s.t||c.t||t.l)&&(h.t||r.t||r.l))||(c.l=!1,d++),!c.r||n==this.pieces.length-1||(c.t||t.r)&&(r.t||r.r)||(c.r=!1,d++),l=d}}},SaveBoard(e=!1){var t=[];this.pieces.forEach((e=>{state="off"==e.state?"":"vertical"==e.state?"v":"h",state+=e.sullied?"s":"",t.push(state)})),this.savedState=t},NewBoard(e=!1){idCount=0,this.totalMoves=0;var t=(document.body.clientWidth-40)/this.divider;this.r.style.setProperty("--pieceSize",t+"px"),this.r.style.setProperty("--gridSize",this.divider),this.pieces=[],this.currentMisses=0;for(let t=0;t<this.divider*this.divider;t++){let i="",s=null,a=!1;e&&null!=this.savedState&&null!=this.savedState[t]&&(i=this.savedState[t].substring(0,1),this.savedState[t].length>1&&(this.totalMoves++,this.loadingSolution?(a=!0,s="v"==i?"horizontal":"vertical"):(i="v"==i?"h":"v",s="v"==i?"vertical":"horizontal")));let h=new PieceObject({state:e?""==i?"off":"v"==i?"vertical":"horizontal":this.pieceStates[getRandomInt(0,this.pieceStates.length)],sullied:a});h.originalState=null==s?h.state:s,this.pieces.push(h)}this.CheckBoard()},ResetBoard(){this.pieces.forEach((e=>{e.state=e.originalState,e.sullied=!1})),this.CheckBoard()},TogglePieceSelection(e){"off"!=e.state&&(e.state="vertical"==e.state?"horizontal":"vertical",e.sullied=e.originalState!=e.state),this.CheckBoard()},SharePuzzle(){this.SaveBoard(),navigator.share({title:"Path",text:"Here's a puzzle I'm working on.",url:"https://"+location.host+location.pathname+"?board="+this.divider+"&walls="+this.savedState.toString()})},ShareSolution(){this.SaveBoard(),navigator.share({title:"Path",text:"Here's a puzzle I've solved.",url:"https://"+location.host+location.pathname+"?solution="+this.divider+"&walls="+this.savedState.toString()})},RestartGame(){this.timer=0,this.numberOfFails=0,this.numberOfClears=0,this.showHome=!1,this.NewGame()},SelectMode(e){},UpdateApp(){this.gameOver},MsToTime(e){var t=(e=(e-e%1e3)/1e3)%60,i=(e=(e-t)/60)%60,s=(e-i)/60;return(0!=s?s+"∶":"")+(0!=i?i+"∶":"")+(0!=i||0!=s?("0"+t).slice(-2):t)},EndGame(){window.confirm("Are you sure you want to quit?")&&(this.gameOver=!0)},GetSettings(){const e=new URLSearchParams(window.location.search);this.loadingSolution=!1,e.has("board")&&(this.divider=Number(e.get("board"))),e.has("solution")&&(this.divider=Number(e.get("solution")),this.loadingSolution=!0),e.has("walls")?this.savedState=e.get("walls").split(","):this.savedState=window.location.search.split(",")},Resize(){var e=(document.body.clientWidth-40)/this.divider;this.r.style.setProperty("--pieceSize",e+"px"),this.r.style.setProperty("--gridSize",this.divider)}},mounted(){this.GetSettings(),null!=this.savedState?this.NewGame(this.savedState.length==this.divider*this.divider):this.NewGame(),window.addEventListener("resize",this.Resize),this.updateInterval=window.setInterval(this.UpdateApp,100)},computed:{}});
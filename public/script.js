const params     = new URLSearchParams(location.search);
const mode       = params.get('mode')       || 'multi';   // 'multi' ou 'solo'
const action     = params.get('action')     || 'join';    // 'create' ou 'join'
const difficulty = params.get('difficulty') || 'easy';
const user       = params.get('user');
const roomId     = params.get('room')       || '';

const password   = mode === 'multi' ? sessionStorage.getItem(`pw_${roomId}`) : '';

// Validação inicial
if (!user || (mode === 'multi' && (!roomId || !password))) {
  alert('Parâmetros inválidos. Por favor, entre novamente na sala.');
  throw new Error('Faltam dados na URL ou senha não encontrada');
}

const board      = document.getElementById('board');
const info       = document.getElementById('info');
const restartBtn = document.getElementById('restart-btn');
const scoreXEl   = document.getElementById('score-X');
const scoreOEl   = document.getElementById('score-O');
const scoreDEl   = document.getElementById('score-draw');


let ws;
let opponentName = '';
let boardState = Array(9).fill('');
let gameEnded  = false;
let symbol, myTurn;
let scoreX = 0, scoreO = 0, scoreD = 0;

function updateScore() {
  scoreXEl.textContent = `X: ${scoreX}`;
  scoreOEl.textContent = `O: ${scoreO}`;
  scoreDEl.textContent = `Empates: ${scoreD}`;
}
function showRestart() {
  restartBtn.classList.remove('hidden');
}

for (let i = 0; i < 9; i++) {
  const cell = document.createElement('div');
  cell.classList.add('cell');
  cell.dataset.index = i;
  board.appendChild(cell);
}

board.addEventListener('click', e => {
  if (!e.target.classList.contains('cell') || gameEnded) return;
  const idx = Number(e.target.dataset.index);
  if (boardState[idx]) return;

  if (mode === 'multi') {
    if (!myTurn) return;
    ws.send(JSON.stringify({ type: 'move', roomId, position: idx, symbol }));
  } else {
    if (!myTurn) return;
    playSolo(idx);
  }
});

restartBtn.addEventListener('click', () => {
  if (mode === 'multi') {
    ws.send(JSON.stringify({ type: 'restart', roomId }));
  } else {
    resetSolo();
  }
  restartBtn.classList.add('hidden');
});

updateScore();
if (mode === 'multi') initMulti();
else               initSolo();

function initMulti() {
  info.textContent = 'Conectando...';
  ws = new WebSocket(`ws://${location.host}`);
  ws.onopen = () => {
    const type = action === 'create' ? 'create-room' : 'join';
    ws.send(JSON.stringify({ type, roomId, password, username: user }));
  };
  ws.onmessage = async event => {
    const msg = JSON.parse(await (event.data instanceof Blob ? event.data.text() : event.data));
    switch (msg.type) {
      case 'player-joined':
        break;
      case 'room-created':
        symbol = 'X'; myTurn = true;
        info.textContent = 'Sala criada! Aguardando oponente...';
        break;
      case 'wait':
        info.textContent = msg.message;
        break;
      case 'init':
        symbol = msg.symbol;
        info.textContent = `Você é ${symbol}. Aguardando início...`;
        break;
      case 'start':
        symbol = msg.symbol;
        opponentName = msg.opponent || '';
        myTurn = msg.currentPlayer === symbol;
        info.textContent = `Você é ${symbol}. Oponente: ${opponentName}. ` +
                           (myTurn ? 'Sua vez!' : 'Vez do oponente.');
        break;
      case 'move':
        applyMove(msg.position, msg.symbol);
        myTurn = msg.nextPlayer === symbol;
        break;
      case 'restart':
        clearBoard();
        break;
      case 'error':
      case 'full':
        alert(msg.message || 'Erro');
        ws.close();
        break;
    }
  };
}

function applyMove(idx, sym) {
  boardState[idx] = sym;
  const cell = board.children[idx];
  cell.textContent = sym;
  cell.style.pointerEvents = 'none';
  const res = checkWin(boardState);
  if (res) endGame(res);
}

function clearBoard() {
  boardState.fill('');
  gameEnded = false;
  board.querySelectorAll('.cell').forEach(c => {
    c.textContent = '';
    c.style.pointerEvents = 'auto';
  });
  info.textContent = 'Nova partida!';
}

function initSolo() {
  symbol = 'X'; myTurn = true;
  opponentName = 'BOT';
  info.textContent = 'Sua vez!';
}

function playSolo(idx) {
  applySolo(idx, 'X');
  if (gameEnded) return;
  myTurn = false;
  info.textContent = 'BOT pensando...';
  setTimeout(() => {
    const idxBot = getBotMove(boardState.slice(), difficulty);
    applySolo(idxBot, 'O');
    if (!gameEnded) {
      myTurn = true;
      info.textContent = 'Sua vez!';
    }
  }, 500);
}

function applySolo(idx, sym) {
  boardState[idx] = sym;
  const cell = board.children[idx];
  cell.textContent = sym;
  cell.style.pointerEvents = 'none';
  const res = checkWin(boardState);
  if (res) endSolo(res);
}

function endSolo(res) {
  if (res === 'empate') {
    info.textContent = 'Empate!';
    scoreD++;
  } else {
    const winnerName = res === symbol ? user : opponentName;
    info.textContent = `Jogador ${winnerName} (${res}) venceu!`;
    if (res === 'X') scoreX++; else scoreO++;
  }
  updateScore(); showRestart(); gameEnded = true;
}

function resetSolo() {
  boardState.fill(''); gameEnded = false; myTurn = true;
  board.querySelectorAll('.cell').forEach(c => {
    c.textContent = ''; c.style.pointerEvents = 'auto';
  });
  info.textContent = 'Sua vez!';
}

function endGame(res) {
  gameEnded = true;
  if (res === 'empate') {
    info.textContent = 'Empate!';
    scoreD++;
  } else {
    const winnerName = res === symbol ? user : opponentName;
    info.textContent = `Jogador ${winnerName} (${res}) venceu!`;
    if (res === 'X') scoreX++; else scoreO++;
  }
  updateScore(); showRestart();
}

function checkWin(s) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a,b,c] of lines) if (s[a] && s[a] === s[b] && s[a] === s[c]) return s[a];
  return s.every(c => c==='X'||c==='O') ? 'empate' : null;
}
function getBotMove(s,diff) {
  if (diff === 'easy') return randomMove(s);
  if (diff === 'medium') return Math.random() < 0.5 ? randomMove(s) : minimaxMove(s);
  return minimaxMove(s);
}
function randomMove(s) {
  const empties = s.map((v,i)=>!v?i:null).filter(i=>i!==null);
  return empties[Math.floor(Math.random()*empties.length)];
}
function minimaxMove(s) {
  let best=-Infinity, move=null;
  for (let i=0;i<9;i++) if(!s[i]){ s[i]='O'; const sc=minimax(s,false); s[i]=''; if(sc>best){ best=sc; move=i; } }
  return move;
}
function minimax(s,max) {
  const w=checkWin(s); if(w) return w==='empate'?0:(w==='O'?1:-1);
  if(max){ let mx=-Infinity; for(let i=0;i<9;i++)if(!s[i]){s[i]='O'; mx=Math.max(mx,minimax(s,false)); s[i]='';} return mx; }
  let mn=Infinity; for(let i=0;i<9;i++)if(!s[i]){s[i]='X'; mn=Math.min(mn,minimax(s,true)); s[i]='';} return mn;
}

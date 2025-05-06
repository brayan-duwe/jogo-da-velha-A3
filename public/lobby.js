const createBox = document.getElementById('createBox');
const joinBox   = document.getElementById('joinBox');
const soloBox   = document.getElementById('soloBox');

elements = [createBox, joinBox, soloBox];
function toggleCreate() {
  createBox.classList.toggle('active');
  joinBox.classList.remove('active');
  soloBox.classList.remove('active');
}
function toggleJoin() {
  joinBox.classList.toggle('active');
  createBox.classList.remove('active');
  soloBox.classList.remove('active');
}
function toggleSolo() {
  soloBox.classList.toggle('active');
  createBox.classList.remove('active');
  joinBox.classList.remove('active');
}

function createRoom() {
  const username = document.getElementById('username').value.trim();
  const room     = document.getElementById('createRoomName').value.trim();
  const password = document.getElementById('createRoomPassword').value.trim();

  if (!username || !room || !password) {
    alert('Preencha todos os campos para criar a sala.');
    return;
  }

  const ws = new WebSocket(`ws://${location.host}`);
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'create-room', roomId: room, password, username }));
  };
  ws.onmessage = ({ data }) => {
    const msg = JSON.parse(data);
    if (msg.type === 'room-created') {
      sessionStorage.setItem(`pw_${room}`, password);
      window.location.href =
        `/game.html?mode=multi&room=${encodeURIComponent(room)}` +
        `&user=${encodeURIComponent(username)}`;
    } else if (msg.type === 'error') {
      alert(msg.message);
    }
    ws.close();
  };
  ws.onerror = (e) => {
    alert('Erro de conexão ao criar sala.');
    console.error(e);
    ws.close();
  };
}

function joinRoom() {
  const username = document.getElementById('username').value.trim();
  const room     = document.getElementById('joinRoomName').value.trim();
  const password = document.getElementById('joinRoomPassword').value.trim();

  if (!username || !room || !password) {
    alert('Preencha todos os campos para entrar na sala.');
    return;
  }

  const ws = new WebSocket(`ws://${location.host}`);
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'join', roomId: room, password, username }));
  };
  ws.onmessage = ({ data }) => {
    const msg = JSON.parse(data);
    if (msg.type === 'init') {
      sessionStorage.setItem(`pw_${room}`, password);
      window.location.href =
        `/game.html?mode=multi&room=${encodeURIComponent(room)}` +
        `&user=${encodeURIComponent(username)}`;
    } else if (msg.type === 'wait') {
      alert(msg.message);
    } else if (msg.type === 'full') {
      alert('Sala cheia.');
    } else if (msg.type === 'error') {
      alert(msg.message);
    }
    ws.close();
  };
  ws.onerror = (e) => {
    alert('Erro de conexão ao entrar na sala.');
    console.error(e);
    ws.close();
  };
}

function startSolo() {
  const username   = document.getElementById('username').value.trim();
  const difficulty = document.getElementById('soloDifficulty').value;
  if (!username || !difficulty) {
    alert('Preencha seu nome e a dificuldade para jogar solo.');
    return;
  }
  window.location.href =
    `/game.html?mode=solo&difficulty=${encodeURIComponent(difficulty)}` +
    `&user=${encodeURIComponent(username)}`;
}

createBox.classList.remove('active');
joinBox.classList.remove('active');
soloBox.classList.remove('active');

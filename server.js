const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const SALAS_PATH = path.join(__dirname, 'salas.json');
if (!fs.existsSync(SALAS_PATH)) fs.writeFileSync(SALAS_PATH, JSON.stringify({}));
let salas = JSON.parse(fs.readFileSync(SALAS_PATH));
const conexoes = {};

function salvarSalas() {
  fs.writeFileSync(SALAS_PATH, JSON.stringify(salas, null, 2));
}
function broadcastToRoom(roomId, payload) {
  const room = conexoes[roomId];
  if (!room) return;
  room.clients.forEach(c => {
    if (c.readyState === WebSocket.OPEN) c.send(JSON.stringify(payload));
  });
}

wss.on('connection', ws => {
  console.log('Nova conexão WebSocket');

  ws.on('message', data => {
    try {
      const msg = JSON.parse(data);
      console.log('Recebido:', msg);
      switch (msg.type) {
        case 'create-room':
          handleCreateRoom(ws, msg);
          break;
        case 'join':
          handleJoinRoom(ws, msg);
          break;
        case 'move':
          handleMove(ws, msg);
          break;
        case 'restart':
          conexoes[msg.roomId].gameState = Array(9).fill(null);
          broadcastToRoom(msg.roomId, { type: 'restart' });
          startGame(msg.roomId);
          break;
      }
    } catch (err) {
      console.error('Erro ao processar:', err);
    }
  });

  ws.on('close', () => {
    console.log('Conexão fechada');
    handleDisconnect(ws);
  });
});

function handleCreateRoom(ws, msg) {
  if (!msg.roomId || !msg.password || !msg.username) {
    ws.send(JSON.stringify({ type: 'error', message: 'Dados de criação incompletos.' }));
    return ws.close();
  }
  if (salas[msg.roomId]) {
    ws.send(JSON.stringify({ type: 'error', message: 'Sala já existe.' }));
    return ws.close();
  }

  salas[msg.roomId] = { senha: msg.password, usuarios: [msg.username] };
  conexoes[msg.roomId] = { clients: [ws], gameState: Array(9).fill(null) };
  salvarSalas();

  console.log(`Sala ${msg.roomId} criada por ${msg.username}`);
  ws.send(JSON.stringify({
    type: 'room-created',
    symbol: 'X',
    roomId: msg.roomId,
    username: msg.username
  }));
}

function handleJoinRoom(ws, msg) {
  if (!msg.roomId || !msg.password || !msg.username) {
    ws.send(JSON.stringify({ type: 'error', message: 'Dados de entrada incompletos.' }));
    return ws.close();
  }
  const sala = salas[msg.roomId];
  if (!sala) {
    ws.send(JSON.stringify({ type: 'error', message: 'Sala não encontrada.' }));
    return ws.close();
  }
  if (sala.senha !== msg.password) {
    ws.send(JSON.stringify({ type: 'error', message: 'Senha incorreta.' }));
    return ws.close();
  }
  if (!conexoes[msg.roomId]) {
    conexoes[msg.roomId] = { clients: [], gameState: Array(9).fill(null) };
  }
  if (conexoes[msg.roomId].clients.length >= 2) {
    ws.send(JSON.stringify({ type: 'full', message: 'Sala cheia.' }));
    return ws.close();
  }

  const symbol = conexoes[msg.roomId].clients.length === 0 ? 'X' : 'O';
  sala.usuarios.push(msg.username);
  conexoes[msg.roomId].clients.push(ws);
  salvarSalas();

  console.log(`${msg.username} entrou em ${msg.roomId} como ${symbol}`);
  ws.send(JSON.stringify({
    type: 'init',
    symbol,
    roomId: msg.roomId,
    username: msg.username
  }));

  if (conexoes[msg.roomId].clients.length === 2) {
    console.log('Dois jogadores conectados, iniciando jogo...');
    startGame(msg.roomId);
  } else {
    ws.send(JSON.stringify({
      type: 'wait',
      message: 'Aguardando outro jogador...',
      roomId: msg.roomId
    }));
  }
}

function startGame(roomId) {
  const room = conexoes[roomId];
  if (!room || room.clients.length !== 2) {
    console.log('Falha ao iniciar - jogadores insuficientes');
    return;
  }
  console.log(`Iniciando jogo em ${roomId}`);
  room.clients.forEach((c, i) => {
    if (c.readyState === WebSocket.OPEN) {
      c.send(JSON.stringify({
        type: 'start',
        symbol: i === 0 ? 'X' : 'O',
        opponent: salas[roomId].usuarios[i === 0 ? 1 : 0],
        roomId,
        currentPlayer: 'X'
      }));
    }
  });
}

function handleMove(ws, msg) {
  const room = conexoes[msg.roomId];
  if (!room || room.clients.length !== 2) return;
  room.gameState[msg.position] = msg.symbol;
  console.log(`Jogada em ${msg.roomId}: ${msg.position}=${msg.symbol}`);
  room.clients.forEach(c => {
    if (c.readyState === WebSocket.OPEN) {
      c.send(JSON.stringify({
        type: 'move',
        position: msg.position,
        symbol: msg.symbol,
        nextPlayer: msg.symbol === 'X' ? 'O' : 'X'
      }));
    }
  });
  checkWinner(msg.roomId);
}

function checkWinner(roomId) {
  // lógica de vitória
}

function handleDisconnect(ws) {
  Object.keys(conexoes).forEach(roomId => {
    const room = conexoes[roomId];
    room.clients = room.clients.filter(c => c !== ws);
    if (room.clients.length === 0) {
      setTimeout(() => {
        if (conexoes[roomId]?.clients.length === 0) {
          delete conexoes[roomId];
          console.log(`Sala ${roomId} removida`);
        }
      }, 30000);
    } else if (room.clients.length === 1) {
      room.clients[0].send(JSON.stringify({
        type: 'opponent-left',
        message: 'Seu oponente saiu.'
      }));
    }
  });
}

app.get('/status', (req, res) => {
  res.json({
    salas: Object.keys(salas),
    conexoesAtivas: Object.entries(conexoes).map(([id, room]) => ({
      roomId: id,
      jogadores: room.clients.length
    }))
  });
});

app.use(express.static('public'));
server.listen(3000, () => console.log('🚀 Servidor rodando em http://localhost:3000'));

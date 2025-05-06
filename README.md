# Jogo da Velha Multiplayer - A3 2025/01

Nesse projeto foram utilizadas as seguintes tecnologias:
<div style="display: inline_block">
    <img align="center" alt="html5" src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
    <img align="center" alt="css3" src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
    <img align="center" alt="javascript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" /></div></br>

## Sumário🔍
- 📁 [public](/public)
    - [📃index.html - Página Inicial do site](/public/index.html)
    - [📃game.html - Página do jogo](/public/game.html)
    - [📃lobby.js - Gerencia botões e ações da página inicial](/public/lobby.js)
    - [📃script.js - Lógica do jogo](/public/script.js)
- [📃server.js - Gerencia conexão entre servidor e cliente](/server.js)
- [🎲salas.json - Armazena nome da sala e senha (calma é só um protótipo😂)](/salas.json)


### [Ver funções detalhadas do projeto🧐](#funções-do-projeto)

O projeto conta com funcionalidades de:
- Criar salas;
- Entrar em salas já existentes;
- Jogar no modo Solo VS BOT, e ainda conta com escolha de dificuldade de jogo (fácil, médio ou difícil)
  
O jogo conta com placar que identifica quem está ganhando na partida, além de um botão de reiniciar que aparece ao fim de cada rodada.



## Imagens do projeto🖼️
<div align="center">
<img src="https://github.com/user-attachments/assets/b4f74466-523e-4618-adf4-643cd9a5e4ef" alt="Homepage - X vs O"></br>
*Página Inicial*
</div></br>
<div align="center">
<img src="https://github.com/user-attachments/assets/1f2b7730-a2b6-4983-bba0-2ecfceb2de6c" width="400" alt="Homepage - X vs O"></br>
*Hover nos botões*
</div></br>
<div align="center">
<img src="https://github.com/user-attachments/assets/3be558c5-760c-4f20-a7b5-d109c1630180" width="400" alt="Homepage - X vs O"></br>
*Ampliação do menu ao clique de um item*
</div></br>
<div align="center">
<img src="https://github.com/user-attachments/assets/c51d3eed-89f9-4d66-a0a5-e9fd403dfb0c" width="400" alt="Homepage - X vs O"></br>
*Escolha a dificuldade - no modo contra o bot*
</div></br>
<div align="center">
<img src="https://github.com/user-attachments/assets/74b9b823-c24d-4988-bfea-863e8002a32f" width="400" alt="Homepage - X vs O"></br>
*Interface do jogo*
</div></br>

---

## Funções do projeto🧐

## [`index.html`](/public/index.html)
> 🏠 **Tela de entrada**
* Onde o jogador:
  * Cria uma sala
  * Entra em uma sala existente
  * Escolhe jogar contra o BOT
* Permite escolher a dificuldade no modo solo.

## [`game.html`](/public/game.html)
> 🔹 **Tela principal do jogo**
* Mostra o tabuleiro do jogo da velha.
* Funciona para partidas online e solo contra o BOT.

## [`lobby.js`](/public/lobby.js)
> 💬 **Lógica da tela inicial (index.html)**
* Controla os botões de:
  * Criar sala
  * Entrar em uma sala
  * Jogar solo contra o BOT
* Valida os dados e redireciona para o jogo com os parâmetros corretos.

## [`script.js`](/public/script.js)
> 🧠 **Lógica do jogo (front-end)**
* Atualiza o tabuleiro conforme as jogadas.
* Verifica se houve vitória ou empate.
* Atualiza o placar.
* Lida com o botão de reiniciar.
* Faz a conexão WebSocket no modo online.
* Controla a lógica do BOT no modo solo (incluindo IA com minimax).

## [`server.js`](/server.js)
> 🧠 **Servidor Node.js**
* Cria e gerencia salas (com senha).
* Usa WebSocket para conectar jogadores em tempo real.
* Controla jogadas, vitórias, empates e reinício de partidas online.

## [`salas.json`](/salas.json)
> 🗞 **Armazena temporariamente as salas criadas**
* Guarda nomes de salas e senhas.
* Usado pelo servidor (`server.js`) para validar entradas nas salas.

## [`style.css`](/public/style.css)
> 🎨 **Estilo visual**
* Define as cores, layout, fontes e aparência do site.
* Deixa o site responsivo para celulares.
* Estiliza o tabuleiro, os botões e as seções.




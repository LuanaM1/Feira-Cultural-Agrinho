//---Variáveis Globais---

//controle e jogador
let player;
let keysPressed = {};
let playerSprite = [];

//Mundo, níveis, inicio e final
let world = []; 
let currentLevel = 0;
let decoration = []; // Elementos decorativos por nível
let endimage;
let startImage = [];
let startButton;
//Npcs e diálogos
let npcs = [];
let currentNPC = null;
let dialoguebox = [];
let isDialogueActive = false; // Flag de diálogo ativo
let dialogueIndex = 0;
let characterDialogueIndex = 0;

//mecanicas
let apple; // Sprite da maçã
let appleCount = 10; // Por que 10 maçãs? É um número balanceado para gameplay!
let applesSold = 0;
let decision = false; // Flag de decisão final ativa
let discourse = [];

//estado do jogo
let instructionIndex = 0;
let gameState = "inicio"; // Estados: inicio, instruction1, instruction2, jogando, finalizando, final
let endingStartTime = 0;
let currentEndingImage = 0;
let endingDialogues = []; // Textos do discurso final
let currentEndingDialogue = 0; // Índice do diálogo final
let isEndingDialogueActive = false;

//Audio e assets
let startMusic;
let bgMusic;
let font;

//---Pré-carregamento de Assets---
function preload() {
  //Sprites do jogador
  playerSprite[0] = loadImage("Sprites/fazendeira.png");
  playerSprite[1] = loadImage("Sprites/fazendeira1.png");
  playerSprite[2] = loadImage("Sprites/anim1/walking1.png");
  playerSprite[3] = loadImage("Sprites/anim1/walking2.png");
  playerSprite[4] = loadImage("Sprites/anim1/walking3.png");
  playerSprite[5] = loadImage("Sprites/anim1/jumping.png");

  //sprites do mundo
   world[0] = loadImage("Sprites/fundo.png");
  world[1] = loadImage("Sprites/fundo1.png");
  world[2] = loadImage("Sprites/fundo2.png");
  world[3] = loadImage("Sprites/fundo3.png");
  world[4] = loadImage("Sprites/fundo4.png");

  //sprites de dialogo
  dialoguebox[0] = loadImage("Sprites/dialogueBoxes/1.png");
  dialoguebox[1] = loadImage("Sprites/dialogueBoxes/2.png");

  //icone da contagem de maçãs
  apple = loadImage("Sprites/apple.png");

  //decoração de mundo
   decoration[0] = loadImage("Sprites/bird.gif");
  decoration[1] = loadImage("Sprites/lilica.png");
  decoration[2] = loadImage("Sprites/cat.png");
  decoration[3] = loadImage("Sprites/person.png");
  decoration[4] = loadImage("Sprites/person2.png");
  decoration[5] = loadImage("Sprites/kid.png");
  decoration[6] = loadImage("Sprites/kid.png");
  decoration[7] = loadImage("Sprites/person3.png");
  decoration[8] = loadImage("Sprites/person4.png");
  decoration[9] = loadImage("Sprites/person5.png");
  discourse[0] = loadImage("Sprites/palco.png");
  discourse[1] = loadImage("Sprites/palco2.png");
  
  //tela final/inicial
  endimage = loadImage("Sprites/endimage.png");
  startImage[0] = loadImage("Sprites/startimage.png");
  startButton = loadImage("Sprites/startbutton.png");
  startImage[1] = loadImage("Sprites/objetivo.png");
  startImage[2] = loadImage("Sprites/tutorial.png");

  //dialogo final!
  endingDialogues = [
    `Estamos aqui para celebrar nossa
cultura. Nossa conexão!`,
    `Percebemos hoje, nessa feira, como é
importante a relação do campo e da
cidade.`,
    `Nós todos dependemos um do outro
para sobreviver, então devemos celebrar.`,
    `Vamos celebrar juntos a nossa conexão!`,
  ];

  //aúdio 
  bgMusic = loadSound("Música/beBorn.mp3");
  startMusic = loadSound("Música/hymnforscarecrow.mp3");
  font = loadFont("Sprites/dialogueBoxes/PixelifySans.otf");
}

//---Configurações essenciais---
function setup() {
  createCanvas(600, 400);
  player = new Player(width / 2, height / 2); 
  //configuração de aúdio
  bgMusic.setVolume(0.1);
  startMusic.setVolume(0.1);
  startMusic.loop();
  //configuração de texto
  fill("#1E4109");
  textSize(20);
  textFont(font);

  //criação de NPCs
  createNpcs(); 
}

function draw() {
  
  noSmooth(); //Sem isso, as imagens pixelizadas ficariam borradas!
  if (gameState === "inicio") {
    drawStartScreen(); //Tela de ínicio
    return;
  } else if (gameState === "instruction1"){
    drawInstruction1(); 
    return
  } else if(gameState === "instruction2"){
    drawInstruction2();
    return
  }

  //Renderização do jogo!
  
  background(220);
  drawWorld(); //fundo e decorações
  drawHUD(); //UI
  player.draw(); //desenha o player
  player.update();

  //Checagem de estados
  if (gameState === "finalizando") { //checa se o player já está na parte final, finalizando
    final();
    return;
  }
  if (gameState === "final") {
    drawFinalScreen(); 
    return;
  }
  if (decision) {
    showDecision();  //checa se o player quer continuar para o final
    return;
  }
  handleDialogue(); //dialogos
}

//---Controles do Teclado---
function keyPressed() {
  const keyLower = key.toLowerCase(); 

  keysPressed[keyLower] = true; 

   // --- Gerenciamento de estados! ---
  
  if(gameState === "instruction1" && keyLower === "e") { //se "e" pressionado em instruction1 ir para instruction2
    gameState = "instruction2"
    return
  }
  if(gameState==="instruction2" && keyLower === "e") {
    gameState = "jogando";
    startMusic.stop();
    bgMusic.loop();
    return
  }
  if (
    gameState === "finalizando" &&
    isEndingDialogueActive &&
    keyLower === "e"
  ) {
    currentEndingDialogue++;
    if (currentEndingDialogue >= endingDialogues.length) {
      // Fim de todos os diálogos
      isEndingDialogueActive = false;
      gameState = "final";
    }
    
    return;
  }

  if (decision) {
    if (keyLower === "s") {
      decisionChoice("sim");
      startMusic.loop();
      return;
    }
  }

  if (keyLower === "n") {
    decisionChoice("não");
    return;
  }
 //DIÁLOGOS 
  if (keyLower === "e") {
    if (isDialogueActive === false) {
      currentNPC = getInteractableNPC();
      if (currentNPC) {
        isDialogueActive = true;
        dialogueIndex = 0;
      }
    } else if (isDialogueActive) {
      dialogueIndex++;
      if (dialogueIndex >= currentNPC.getCurrentDialogue().length) {
        isDialogueActive = false;
        if (!currentNPC.alreadyTalked) {
          currentNPC.alreadyTalked = true;
          appleCount = Math.max(appleCount - 1, 0);
          applesSold = applesSold + 1;
        }

        currentNPC = null;
      }
    }
  }
}

function keyReleased() {
  const keyLower = key.toLowerCase();
  delete keysPressed[keyLower];
  if (keyLower === "w") {
    player.canJump = true; // Reset do pulo, melhora responsividade
  }
}

//---CLASSES E FUNÇÕES---
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 5; 
    this.isFlipped = false; //para flip horizontal
    this.currentFrame = 0; //frame atual da animação
    this.animationCounter = 0;
    this.animationSpeed = 8; //quanto maior o numero mais lento a troca de frames!
    this.isMoving = false;
    this.isJumping = false;
    this.jumpForce = -12; //força inicial do pulo
    this.gravity = 0.6;
    this.jumpVelocity = 0;
    this.groundY = y; //posição inicial
    this.canJump = true; //Previne pulos infinitos
    this.IsIdle = true;
    this.idleFrame = 0;
    this.animationIdleSpeed = 20;
  }

  update() {
    //Checagem de estados do jogo
    if (gameState === "fim") {
      return;
    }
    
    //Controle de Movimento
    if (!isDialogueActive && !decision) {
      let mvmt = createVector(0, 0);

      if (keysPressed.a) {
        mvmt.x -= 1;
        this.isFlipped = true;
      }
      if (keysPressed.d) {
        mvmt.x += 1;
        this.isFlipped = false;
      }
      //Física de Pulo
      if (keysPressed.w && this.canJump && !this.isJumping) {
        this.jumpVelocity = this.jumpForce;
        this.isJumping = true;
        this.canJump = false; //impede que o jogador faça outros pulos no ar.
      }
       // Aplicação de Gravidade
      this.jumpVelocity += this.gravity;
      this.y += this.jumpVelocity;
      
      // Detecção de Chão
      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.jumpVelocity = 0;
        this.isJumping = false;
      }

      mvmt.setMag(this.speed);
      this.x += mvmt.x;
      this.y += mvmt.y;

      if (this.x >= 605) { // 605 = width + 5 (margem para troca de nível)
       if (currentLevel < world.length - 1) {
          currentLevel++;
          this.x = 0;
          this.y = height / 2;
        } else {
          this.x = 605 - this.speed;
          if (currentLevel === 4) {
            this.x = 605 - this.speed; //605 evita que o jogador ative a decisão repetidamente
            decision = true;
          }
        }
      }

      if (this.x <= -30) {
        // fim do canvas esquerdo
        if (currentLevel > 0) {
          currentLevel--;
          this.x = width - 30;
          this.y = height / 2;
        } else {
          this.x = -30 + this.speed; //impedir que o jogador ultrapasse o fim do canvas definido como -30
        }
      }

      this.isMoving = mvmt.x !== 0; //checa se o movimento diferente de zero para ativar animação
      if (this.isMoving) {
        this.animationCounter++;
        if (this.animationCounter >= this.animationSpeed) {
          this.currentFrame = (this.currentFrame + 1) % 3;
          this.animationCounter = 0;
        }
      } else {
        this.currentFrame = 0;
      }

      this.isIdle = mvmt.x === 0 && !this.isJumping; //checa se o movimento é igual a zero e o jogador não esta pulando, evitando assim a animação Idle durante movimento ou pulo.
      if (this.isIdle) {
        this.animationCounter++;
        if (this.animationCounter >= this.animationIdleSpeed) {
          this.idleFrame = (this.idleFrame + 1) % 2;
          this.animationCounter = 0;
        }
      }
    }
  }

  draw() {
    push();
    translate(this.x, this.y);

    if (this.isFlipped) {
      scale(-1, 1); //inverte se necessario
    }
    noSmooth();
  // Seleção de sprites baseada no estado do jogador
    if (this.isJumping) {
      image(playerSprite[5], -45, 0, 90, 100);
    } else if (this.isMoving) {
      image(playerSprite[this.currentFrame + 2], -45, 0, 90, 100);
    } else {
      image(playerSprite[this.idleFrame], -45, 0, 90, 100); 
    }
    pop();
  }
}

class NPC {
  constructor(
    x,
    y,
    level,
    firstDialogue, // Diálogo antes de vender
    secondDialogue, // Diálogo após venda
    interactionRange = 100 // Raio de interação em pixels
  ) {
    this.x = x;
    this.y = y;
    this.level = level;
    this.dialogue = firstDialogue;
    this.secondDialogue = secondDialogue;
    this.range = interactionRange;
    this.alreadyTalked = false;
  }
  isPlayerInRange(playerX, playerY) {
    return dist(playerX, playerY, this.x, this.y) < this.range;
  }
  getCurrentDialogue() {
    //Impede diálogos repetidos
    if (this.alreadyTalked) {
      return this.secondDialogue;
    } else {
      return this.dialogue;
    }
  }
}

function getInteractableNPC() {
  //encontrar o NPC que está próximo do jogador e pode ser interagido.
  return npcs.find(
    (npc) =>
      npc.level === currentLevel && npc.isPlayerInRange(player.x, player.y)
  );
}
function showDecision() {
  image(dialoguebox[1], 160, 180, 300, 150);
}
function decisionChoice(choice) {
  if (choice === "sim") {
    gameState = "finalizando";
    endingStartTime = millis();
    currentEndingImage = 0;
  } else {
    //Reposiciona o jogador para fora da borda
    player.x = width - 50;  // 50px da borda direita
  }
  decision = false;
}
function final() {
  bgMusic.stop();
  image(discourse[currentEndingImage], 0, 0, width, height);
  let timeElapsed = (millis() - endingStartTime) / 1000;
  if (timeElapsed > 1 && currentEndingImage === 0) {
    currentEndingImage = 1;
  }
  if(currentEndingImage === 1){
    image(dialoguebox[0], 50, 250);
    text(endingDialogues[currentEndingDialogue], 100, 300);
    isEndingDialogueActive = true;
  }
}

function createNpcs() {
  npcs.push(
    new NPC(
      80,
      240,
      1,
      [
        `Olá Fazendeira!
Ah... Você quer saber sobre o que estou 
vendendo?`,
        `Bem, eu estou vendendo milho,
sabia que a maioria das pessoas que 
compram meu milho são da cidade?`,
        `Interessante, não? São praticamente 
meus melhores clientes! E estão
todos aqui hoje!`,
        `Oh! Você está vendendo maçãs?
Que incrível! Eu quero uma!`,
      ],
      [
        `Um milho por dia afasta os médicos!...
Ou eram maçãs?`,
      ]
    )
  );
  npcs.push(
    new NPC(
      480,
      240,
      1,
      [
        `Oi! Você quer saber como pesquei esses? 
Primeiro eu fui a cidade, sabe?
comprar uma vara de pescar boa!`,
        `Eu sou do campo, então 
sou meio dependente de ir na cidade 
uma hora outra para comprar iscas e linha!`,
        `Isso também é importante, iscas boas 
e uma linha forte. Além de claro pescar 
somente em locais permitidos!`,
        `O resto depende de sua habilidade de pesca.`,
        `Ah! Você está vendendo maçãs! Quero uma!`,
      ],
      [`Tem um monte de gente da cidade aqui...`]
    )
  );
  npcs.push(
    new NPC(
      130,
      240,
      2,
      [
        `Olá querida! Quer uma laranja?
Sabe, a maior parte da produção 
de laranjas ocorre em áreas rurais!`,
        `Enquanto o comércio acontece na cidade.
Ah, a relação campo e cidade é tão bonita!`,
        `Oooh! Maçãs! Me dê uma!`,
      ],
      [
        `Sabia que a cor laranja foi nomeada por 
causa da fruta? `,
      ]
    )
  );
  npcs.push(
    new NPC(
      480,
      240,
      2,
      [
        `Bananas! Bananas! Para todos!
Ah! Olá Fazendeira! Como vai?
Eu vou muito bem!`,
        `Sabe todas as mudas que eu compro
são de qualidade! Onde eu as compro 
você pergunta? Na cidade, claro!`,
        `Você está vendendo maçãs? Uhm...
Certo, me dá uma!`,
      ],
      [
        `O Dia Mundial da Banana é comemorado 
em 22 de setembro!`,
      ]
    )
  );
  npcs.push(
    new NPC(
      130,
      240,
      3,
      [
        `Vai um cafézinho aí? 
Só temos os melhores grãos!`,
        `As pessoas que vieram da cidade 
estão aproveitando o desconto bastante! 
Já vendi uns 20 pacotes.`,
        `Sabe, a cidade é muito importante 
para minha produção! Eles me fornecem tudo
a um bom preço!`,
        `Ooh, maçãs! Bom, estou com fome,
então quero uma!`,
      ],
      [`Café! Café! Quem quer café?`]
    )
  );
  npcs.push(
    new NPC(
      465,
      240,
      3,
      [
        `Estou vendendo alface cultivados 
em uma horta, sem agrotóxicos...`,
        `Apoie a agricultura familiar
comprando um!`,
        `Eu também entrego alfaces nas 
escolas da cidade!`,
        `Maçãs? Claro, aceito uma.`,
      ],
      [`Meus alfaces são frescos!`]
    )
  );
  npcs.push(
    new NPC(
      125,
      240,
      4,
      [
        `Boa tarde, fazendeira! 
Estou vendendo batatas por 
um precinho bom!`,
        `Estou tendo vários clientes da cidade hoje!
Isso me ajuda na venda das
batatas!`,
        `Embora a produção de batata seja no
campo, são os da cidade que mais compram!`,
        `Ooh! Você tá vendendo maçãs? Quero uma!`,
      ],
      [
        `Você prefere batata
frita ou assada?`,
      ]
    )
  );
  npcs.push(
    new NPC(
      470,
      240,
      4,
      [
        `Boa tarde! As cenouras são 
de qualidade aqui!`,
        `Esta tendo bastante demanda
hoje nessa venda,
que bom que eu vim!`,
        `Maçãs? Aceito sim!`,
      ],
      [`Cenouras são ricas em vitamina A!`]
    )
  );
  npcs.push(
    new NPC(
      290,
      240,
      1,
      [
        `Ah, olá, você que irá 
fazer o discurso não é?`,
        `Boa sorte! Ah, você está 
vendendo maçãs também?`,
        `Aceito uma!`,
      ],
      [`Essa feira tem bons preços!`],
      50
    )
  );
  npcs.push(
    new NPC(
      300,
      240,
      2,
      [
        `Essas tendas são tão fofas!
Ah! Olá! Você está vendendo maçãs?.`,
        `..Ok, aceito uma!`,
      ],
      [
        `Essas laranjas parecem
suculentas!`,
      ],
      50
    )
  );
}
function drawWorld() {
  image(world[currentLevel], 0, 0, 600, 400);

  if (currentLevel === 1) {
    image(decoration[0], 78, 120);
    image(decoration[4], 260, 190, 60, 120);
    image(decoration[5], 300, 190, 60, 120);
  }
  if (currentLevel === 2) {
    image(decoration[1], 400, 260, 72, 52);
    image(decoration[3], 340, 190, 60, 120);
    image(decoration[7], 300, 190, 60, 120);
  }
  if (currentLevel === 3) {
    image(decoration[2], 205, 242, 64, 64);
    image(decoration[9], 320, 190, 60, 120);
  }
  if (currentLevel === 4) {
    image(decoration[0], 400, 270);
    image(decoration[8], 210, 190, 60, 120);
  }
}
function drawHUD() {
  //contagem de maçãs
  image(apple, 15, 15, 30, 30);
  text(appleCount + " maçãs", 55, 38);
}
function handleDialogue() {
  if (isDialogueActive && currentNPC) {
    image(dialoguebox[0], 50, 250);
    text(currentNPC.getCurrentDialogue()[dialogueIndex], 100, 300);
  }
  if (!isDialogueActive && getInteractableNPC()) {
    text("aperte E!", player.x, player.y - 30);
  }
}
function drawFinalScreen() {
  bgMusic.stop();
  image(endimage, 0, 0);
  fill("black");
  textSize(35);
  textAlign(CENTER);
  text("Você vendeu " + applesSold + " Maçãs!", width / 2, 350);
}
function drawStartScreen() {
  background(startImage[0]);
  image(startButton, 225, height / 2, 150, 80);
}
function mousePressed() {
  if (gameState === "inicio") {
    const buttonX = 225;
    const buttonY = height / 2;
    const buttonW = 150;
    const buttonH = 80;
    if (
      mouseX > buttonX &&
      mouseX < buttonX + buttonW &&
      mouseY > buttonY &&
      mouseY < buttonY + buttonH
    ) {
      gameState = "instruction1";
    }
  }
  
}
function drawInstruction1(){
  image(startImage[1],0,0,width,height)
}
function drawInstruction2(){
      image(startImage[2],0,0,width,height)
    }

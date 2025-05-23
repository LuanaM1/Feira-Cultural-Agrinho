let jogador;
let teclaPressionada = {};
let jogadorSprite = [];
let world = [];
let currentLevel = 0;
let bgMusic;
let dialoguebox;
let isDialogueActive = false;
let dialogueIndex = 0;
let characterDialogueIndex = 0;
let font;
let npcs = [];
let currentNPC = null;
let apple;
let appleCount = 10;

function preload() {
  jogadorSprite[0] = loadImage("Sprites/fazendeira.png");
  jogadorSprite[1] = loadImage("Sprites/fazendeira1.png");
  jogadorSprite[2] = loadImage("Sprites/anim1/walking1.png");
  jogadorSprite[3] = loadImage("Sprites/anim1/walking2.png");
  jogadorSprite[4] = loadImage("Sprites/anim1/walking3.png");
  jogadorSprite[5] = loadImage("Sprites/anim1/jumping.png");

  world[0] = loadImage("Sprites/fundo.png");
  world[1] = loadImage("Sprites/fundo1.png");
  world[2]= loadImage("Sprites/fundo2.png");
  world[3]= loadImage("Sprites/fundo3.png");
  world[4]= loadImage("Sprites/fundo4.png");
  dialoguebox = loadImage("Sprites/dialogueBoxes/1.png");
  apple = loadImage("Sprites/apple.png");
  bgMusic = loadSound("Música/beBorn.mp3");
  font = loadFont("Sprites/dialogueBoxes/PixelifySans.otf");
}

function setup() {
  createCanvas(600, 400);
  jogador = new Jogador(width / 2, height / 2);
  bgMusic.setVolume(0.1);
  bgMusic.loop();

  fill("#1E4109");
  textSize(20);
  textFont(font);
  npcs.push(new NPC(80,240,1,[`Olá Fazendeira!
Ah... Você quer saber sobre o que estou 
vendendo?`,`Bem, eu estou vendendo milho,
sabia que o milho é a segunda maior cultura 
exportada do Brasil?`,`Legal, né?`,
`Oh! Você está vendendo maçãs?
Que incrível! Eu quero uma!`],[`Um milho por dia afasta os médicos!...
Ou eram maçãs?`]));
  npcs.push(new NPC(480, 240, 1, [`Oi! Você quer saber como pesquei esses? 
Primeiro eu fui a cidade, sabe?
comprar uma vara de pescar boa!`,`Eu sou do campo, então 
sou meio dependente de ir na cidade 
uma hora outra para comprar iscas e linha!`,`Isso também é importante, iscas boas 
e uma linha forte. Além de claro pescar 
somente em locais permitidos!`, `O resto depende de sua habilidade de pesca.
Ah! Você está vendendo maçãs! Quero uma!`], [`Peixe é rico em omêga três! 
Gordura saúdavel!`]));
  npcs.push(new NPC(130, 240, 2,[`oi`],[`blah blah!`]));
  npcs.push(new NPC(480, 240, 2,[`oi`],[`blah blah!`]));
}


function draw() {
  console.log(mouseX, mouseY);
  background(220);
  noSmooth(); //´para não suavizar a imagem de pixel art pois perde a qualidade
  image(world[currentLevel], 0, 0, 600, 400);
  image(apple, 15, 15, 30, 30);

  jogador.update();
  jogador.draw();

  if (isDialogueActive && currentNPC) {
    image(dialoguebox, 50, 250);
    text(currentNPC.getCurrentDialogue()[dialogueIndex], 100, 300);
  }
  if (!isDialogueActive && getInteractableNPC()) {
    text("aperte E!", jogador.x, jogador.y - 30);
  }
  text(appleCount + " maçãs", 55, 38);
}

function keyPressed() {
  const keyLower = key.toLowerCase();
  teclaPressionada[keyLower] = true;

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
        }

        currentNPC = null;
      }
    }
  }
}

function keyReleased() {
  const keyLower = key.toLowerCase();
  delete teclaPressionada[keyLower];
  if (keyLower === "w") {
    jogador.canJump = true;
  }
}

class Jogador {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 5;
    this.isFlipped = false;
    this.currentFrame = 0;
    this.animationCounter = 0;
    this.animationSpeed = 8; //quanto maior o numero mais lento a troca de frame!
    this.isMoving = false;
    this.isJumping = false;
    this.jumpForce = -12;
    this.gravity = 0.6;
    this.jumpVelocity = 0;
    this.groundY = y;
    this.canJump = true; //impede que o jogador faça pulos infinitamente.
    this.IsIdle = true;
    this.idleFrame = 0;
    this.animationIdleSpeed = 20;
  }

  update() {
    if (!isDialogueActive) {
    let mvmt = createVector(0, 0);

    // movimento e a inversão do JogadorSprite
    if (teclaPressionada.a) {
      mvmt.x -= 1;
      this.isFlipped = true;
    }
    if (teclaPressionada.d) {
      mvmt.x += 1;
      this.isFlipped = false;
    }
    if (teclaPressionada.w && this.canJump && !this.isJumping) {
      this.jumpVelocity = this.jumpForce;
      this.isJumping = true;
      this.canJump = false; //impede que o jogador faça outros pulos no ar.
    }
    
    
    this.jumpVelocity += this.gravity;
    this.y += this.jumpVelocity;

    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.jumpVelocity = 0;
      this.isJumping = false;
    }

    mvmt.setMag(this.speed);
    this.x += mvmt.x;
    this.y += mvmt.y;
    console.log(this.x);
    
    
    
    if (this.x >= 605) {
      // fim do canvas direito
      if (currentLevel < world.length - 1) {
        currentLevel++;
        this.x = 0;
        this.y = height / 2;
      } else {
        this.x = 605 - this.speed;
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

    if (this.isFlipped) scale(-1, 1); //inverte se necessario
    noSmooth();

    if (this.isJumping) {
      image(jogadorSprite[5], -45, 0, 90, 100);
    } else if (this.isMoving) {
      image(jogadorSprite[this.currentFrame + 2], -45, 0, 90, 100);
    } else {
      image(jogadorSprite[this.idleFrame], -45, 0, 90, 100); //Animação para quando o jogador não esta se movendo.
    }
    pop();
  }
}

class NPC {
  constructor(x,y,level,firstDialogue,secondDialogue,interactionRange = 100) {
    this.x = x;
    this.y = y;
    this.level = level;
    this.dialogue = firstDialogue;
    this.secondDialogue = secondDialogue;
    this.range = interactionRange;
    this.alreadyTalked = false;
  }
  isPlayerInRange(jogadorX, jogadorY) {
    return dist(jogadorX, jogadorY, this.x, this.y) < this.range;
  }
  getCurrentDialogue() { //Impede diálogos repetidos
    if (this.alreadyTalked) {
      return this.secondDialogue;
    } else {
      return this.dialogue;
    }
  }
}

function getInteractableNPC() { //encontrar o NPC que está próximo do jogador e pode ser interagido.
  return npcs.find(
    (npc) =>
      npc.level === currentLevel && npc.isPlayerInRange(jogador.x, jogador.y)
  );
}

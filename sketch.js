let jogador;
let teclaPressionada = {};
let jogadorSprite = [];
let world = [];
let currentLevel = 0;
let bgMusic;
let dialoguebox = [];

function preload() {
  jogadorSprite[0] = loadImage("Sprites/fazendeira.png");
  jogadorSprite[1] = loadImage("Sprites/fazendeira1.png");
  jogadorSprite[2] = loadImage("Sprites/anim1/walking1.png");
  jogadorSprite[3] = loadImage("Sprites/anim1/walking2.png");
  jogadorSprite[4] = loadImage("Sprites/anim1/walking3.png");
  jogadorSprite[5] = loadImage("Sprites/anim1/jumping.png");

  world[0] = loadImage("Sprites/fundo.png");
  world[1] = loadImage("Sprites/fundo1.png");
  dialoguebox[0] = loadImage("Sprites/dialogueBoxes/1.png");
  bgMusic = loadSound("Música/beBorn.mp3");
}

function setup() {
  createCanvas(600, 400);
  jogador = new Jogador(width / 2, height / 2);
  bgMusic.setVolume(0.1);
  bgMusic.loop();
}

function draw() {
  console.log(mouseX, mouseY);
  background(220);
  noSmooth(); //´para não suavizar a imagem de pixel art pois perde a qualidade
  image(world[currentLevel], 0, 0, 600, 400);

  jogador.update();
  jogador.draw();
  image(dialoguebox[0], 50, 250);
}

function keyPressed() {
  teclaPressionada[key.toLowerCase()] = true; // para evitar erros quando uma letra maiuscula é apertada
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
    if (teclaPressionada.e) {
      dialogue();
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
function dialogue() {
  if (currentLevel === 1) {
    if (jogador.x >= 40 && jogador.x <= 200) {
      console.log("hi");
    }
  }
}

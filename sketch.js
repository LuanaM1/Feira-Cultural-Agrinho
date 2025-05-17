let jogador;
let teclaPressionada = {};
let jogadorSprite = [];
let world = [];
let currentLevel = 0;
let bgMusic;

function preload() {
  jogadorSprite[0] = loadImage("Sprites/fazendeira.png");
  jogadorSprite[1] = loadImage("Sprites/fazendeira1.png");
  jogadorSprite[2] = loadImage("Sprites/anim1/walking1.png");
  jogadorSprite[3] = loadImage("Sprites/anim1/walking2.png");
  jogadorSprite[4] = loadImage("Sprites/anim1/walking3.png");
  jogadorSprite[5] = loadImage("Sprites/anim1/jumping.png");

  world[0] = loadImage("Sprites/fundo.png");
  world[1] = loadImage("Sprites/fundo1.png");
  bgMusic = loadSound("Música/beBorn.mp3");
}

function setup() {
  createCanvas(600, 400);
  jogador = new Jogador(width / 2, height / 2);
  bgMusic.setVolume(0.1);
  bgMusic.loop();
}

function draw() {
  background(220);
  noSmooth();
  image(world[currentLevel], 0, 0, 600, 400);
  jogador.update();
  jogador.draw();
}

function keyPressed() {
  teclaPressionada[key.toLowerCase()] = true;
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
    this.animationSpeed = 8;
    this.isMoving = false;
    this.isJumping = false;
    this.jumpForce = -12;
    this.gravity = 0.6;
    this.jumpVelocity = 0;
    this.groundY = y;
    this.canJump = true;
    this.IsIdle = true;
    this.idleFrame = 0;
    this.animationIdleSpeed = 20;
  }

  update() {
    let mvmt = createVector(0, 0);

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
      this.canJump = false;
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

    // In your Jogador class update() method, modify the boundary checks:
    if (this.x >= 605) {
      // Right edge
      if (currentLevel < world.length - 1) {
        //checa pra ver se o level e menor que o tamnanho da lista world - 1
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
        this.x = -30 + this.speed;
      }
    }

    this.isMoving = mvmt.x !== 0;
    if (this.isMoving) {
      this.animationCounter++;
      if (this.animationCounter >= this.animationSpeed) {
        this.currentFrame = (this.currentFrame + 1) % 3;
        this.animationCounter = 0;
      }
    } else {
      this.currentFrame = 0;
    }

    this.isIdle = mvmt.x === 0 && !this.isJumping;
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
    if (this.isFlipped) scale(-1, 1);
    noSmooth();

    if (this.isJumping) {
      image(jogadorSprite[5], -45, 0, 90, 100);
    } else if (this.isMoving) {
      image(jogadorSprite[this.currentFrame + 2], -45, 0, 90, 100);
    } else {
      image(jogadorSprite[this.idleFrame], -45, 0, 90, 100);
    }
    pop();
  }
}

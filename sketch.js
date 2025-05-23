let jogador;
let teclaPressionada = {}; //objeto vazio
let jogadorSprite;
let world;

function preload() {
  jogadorSprite = loadImage("Sprites/fazendeira.png");
  world = loadImage("Sprites/fundo.png");
}

function setup() {
  createCanvas(600, 400);
  jogador = new Jogador(width / 2, height / 2);
}

function draw() {
  background(220);
  image(world, 0, 0, 600, 400);

  jogador.update();
  jogador.draw();
}
function keyPressed() {
  // Converter tecla em letras minúsculas
  teclaPressionada[key.toLowerCase()] = true;
}
function keyReleased() {
  // Converter tecla em letras minúsculas
  delete teclaPressionada[key.toLowerCase()];
}

class Jogador {
  constructor(x, y) {
    this.x = x;

    this.y = y;
    this.speed = 4; //define velocidade
  }
  update() {
    console.log(teclaPressionada);
    let mvmt = createVector(0, 0); // Cria um objeto vector
    if (teclaPressionada.a) {
      mvmt.x -= 1;
    }
    if (teclaPressionada.d) {
      mvmt.x += 1;
    }
    if (teclaPressionada.w) {
      mvmt.y -= 1;
    }

    mvmt.setMag(this.speed);

    this.x += mvmt.x;
    this.y += mvmt.y;
  }
  draw() {
    noSmooth();
    image(jogadorSprite, this.x, this.y, 90, 100);
  }
}

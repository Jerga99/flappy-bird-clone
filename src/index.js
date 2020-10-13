

import Phaser from 'phaser';

const config = {
  // WebGL (Web graphics library) JS Api for rendering 2D and 3D graphics
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    // Arcade physics plugin, manages physics simulation
    default: 'arcade',
    arcade: {
      debug: true,
    }
  },
  scene: {
    preload,
    create,
    update
  }
}

const VELOCITY = 200;

let bird = null;

let upperPipe = null;
let lowerPipe = null;

const pipeVerticalDistanceRange = [150, 250];
let pipeVerticalDistance = Phaser.Math.Between(...pipeVerticalDistanceRange)

const flapVelocity = 250;
const initalBirdPosition = {x: config.width * 0.1, y: config.height / 2}

function preload() {
  this.load.image('sky', 'assets/sky.png');
  this.load.image('bird', 'assets/bird.png');
  this.load.image('pipe', 'assets/pipe.png');
}

function create() {
  this.add.image(0, 0, 'sky').setOrigin(0);
  bird = this.physics.add.sprite(initalBirdPosition.x, initalBirdPosition.y, 'bird').setOrigin(0);
  bird.body.gravity.y = 400;

  upperPipe = this.physics.add.sprite(400, 100, 'pipe').setOrigin(0, 1);
  lowerPipe = this.physics.add.sprite(400, upperPipe.y + pipeVerticalDistance, 'pipe').setOrigin(0, 0);

  this.input.on('pointerdown', flap);
  this.input.keyboard.on('keydown_SPACE', flap);
}

// if bird y position is small than 0 or greater than height of the canvas
// then alert "you have lost"
function update(time, delta) {
 if (bird.y > config.height || bird.y < -bird.height) {
  restartBirdPosition();
 }
}

function restartBirdPosition() {
  bird.x = initalBirdPosition.x;
  bird.y = initalBirdPosition.y;
  bird.body.velocity.y = 0;
}

function flap() {
  bird.body.velocity.y = -flapVelocity;
}


new Phaser.Game(config);

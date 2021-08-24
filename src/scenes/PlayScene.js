
import BaseScene from './BaseScene';

const PIPES_TO_RENDER = 4;
const COINS_TO_RENDER = 3;

class PlayScene extends BaseScene {

  constructor(config) {
    super('PlayScene', config);

    this.bird = null;
    this.pipes = null;
    this.isPaused = false;

    this.pipeHorizontalDistance = 0;
    this.flapVelocity = 300;
    this.scaleRation = 1;

    this.score = 0;
    this.scoreText = '';

    this.currentDifficulty = 'easy';
  }

  create() {
    super.create();

    this.difficulties = {
      'easy': {
        pipeHorizontalDistanceRange: [300 * this.scaleRatio, 350 * this.scaleRatio],
        pipeVerticalDistanceRange: [150 * this.scaleRatio, 200 * this.scaleRatio]
      },
      'normal': {
        pipeHorizontalDistanceRange: [280 * this.scaleRatio, 330 * this.scaleRatio],
        pipeVerticalDistanceRange: [140 * this.scaleRatio, 190 * this.scaleRatio]
      },
      'hard': {
        pipeHorizontalDistanceRange: [250 * this.scaleRatio, 310 * this.scaleRatio],
        pipeVerticalDistanceRange: [50 * this.scaleRatio, 100 * this.scaleRatio]
      }
    }

    const canvas	= document.getElementsByTagName('canvas')[0];
    this.screenWidth = canvas.width;
    this.screenHeight = canvas.height;

    this.currentDifficulty = 'easy';
    this.createBird();
    this.createPipes();
    this.createColliders();
    this.createScore();
    this.createPause();
    this.handleInputs();
    this.listenToEvents();

    this.anims.create({
      key: 'fly',
      frames: this.anims.generateFrameNumbers('bird', { start: 8, end: 15}),
      // 24 fps default, it will play animation consisting of 24 frames in 1 second
      // in case of framerate 2 and sprite of 8 frames animations will play in
      // 4 sec; 8 / 2 = 4
      frameRate: 8,
      // repeat infinitely
      repeat: -1
    })


    this.bird.play('fly');
    // this.scale.on('resize', resize, this);
  }

  update() {
    this.checkGameStatus();
    this.recyclePipes();
  }

  listenToEvents() {
    if (this.pauseEvent) { return; }

    this.pauseEvent = this.events.on('resume', () => {
      this.initialTime = 3;
      this.countDownText = this.add.text(...this.screenCenter, 'Fly in: ' + this.initialTime, this.fontOptions).setOrigin(0.5);
      this.timedEvent = this.time.addEvent({
        delay: 1000,
        callback: this.countDown,
        callbackScope: this,
        loop: true
      })
    })
  }

  countDown() {
    this.initialTime--;
    this.countDownText.setText('Fly in: ' + this.initialTime);
    if (this.initialTime <= 0) {
      this.isPaused = false;
      this.countDownText.setText('');
      this.physics.resume();
      this.timedEvent.remove();
    }
  }

  createBird() {
    this.bird = this.physics.add.sprite(20, this.screenHeight / 2, 'bird')
      .setFlipX(true)
      .setScale(3 * this.scaleRatio)
      .setOrigin(0);

    this.bird.setBodySize(this.bird.width, this.bird.height - 8);
    this.bird.body.gravity.y = 600 * this.scaleRatio;
    this.bird.setCollideWorldBounds(true);
  }

  createPipes() {
    this.pipes = this.physics.add.group();
    this.coins = this.physics.add.group();

    this.coins.createMultiple({
        classType: Phaser.Physics.Arcade.Sprite,
        frameQuantity: 10,
        frame: 'bomb',
        visible: false,
        active: false
    });

    for (let i = 0; i < PIPES_TO_RENDER; i++) {
      const upperPipe = this.pipes.create(0, 0, 'pipe')
        .setImmovable(true)
        .setOrigin(0, 1)
        .setScale(this.scaleRatio, 2 * this.scaleRatio);
      const lowerPipe = this.pipes.create(0, 0, 'pipe')
        .setImmovable(true)
        .setOrigin(0, 0)
        .setScale(this.scaleRatio, 2 * this.scaleRatio);

      this.placePipe(upperPipe, lowerPipe)
    }

    this.pipes.setVelocityX(-200 * this.scaleRatio);
  }

  createColliders() {
    this.physics.add.collider(this.bird, this.pipes, this.gameOver, null, this);
  }

  createScore() {
    this.score = 0;
    const bestScore = localStorage.getItem('bestScore');
    this.scoreText = this.add.text(16, 16, `Score: ${0}`, { fontSize: '32px', fill: '#000'});
    this.add.text(16, 52, `Best score: ${bestScore || 0}`, { fontSize: '18px', fill: '#000'});
  }

  createPause() {
    this.isPaused = false;
    const pauseButton = this.add.image(this.config.width - 10, this.config.height -10, 'pause')
      .setInteractive()
      .setScale(3 * this.scaleRatio)
      .setOrigin(1);

    pauseButton.on('pointerdown', () => {
      this.isPaused = true;
      this.physics.pause();
      this.scene.pause();
      this.scene.launch('PauseScene');
    })
  }

  handleInputs() {
    this.input.on('pointerdown', this.flap, this);
    this.input.keyboard.on('keydown_SPACE', this.flap, this);
  }

  checkGameStatus() {
    if (this.bird.getBounds().bottom >= this.config.height || this.bird.y <= 0) {
      this.gameOver();
    }
  }

  placePipe(uPipe, lPipe) {
    const difficulty = this.difficulties[this.currentDifficulty];
    const rightMostX = this.getRightMostPipe();

    const pipeVerticalDistance = Phaser.Math.Between(...difficulty.pipeVerticalDistanceRange);
    const pipeVerticalPosition = Phaser.Math.Between(0 + 20, (this.screenHeight - 20) - pipeVerticalDistance);
    const pipeHorizontalDistance = Phaser.Math.Between(...difficulty.pipeHorizontalDistanceRange);

    uPipe.x = rightMostX + pipeHorizontalDistance;
    uPipe.y = pipeVerticalPosition;

    lPipe.x = uPipe.x;
    lPipe.y = uPipe.y + pipeVerticalDistance

    const distanceBetweenPipes = (uPipe.x - uPipe.width * this.scaleRatio) - rightMostX;
    let distanceBetweenCoins = distanceBetweenPipes / COINS_TO_RENDER;
    let coinX = lPipe.x + distanceBetweenCoins;

    for(let i = 0; i < COINS_TO_RENDER; i++) {
      this.coins
        .get(coinX, uPipe.y + Phaser.Math.Between(-150 * this.scaleRatio, 450 * this.scaleRatio), 'bomb')
        .setVelocityX(-200 * this.scaleRatio)
        .setScale(this.scaleRatio);

        coinX += distanceBetweenCoins;
    }
  }

  recyclePipes() {
    const tempPipes = [];
    this.pipes.getChildren().forEach(pipe => {
      if (pipe.getBounds().right <= 0) {
        tempPipes.push(pipe);
        if (tempPipes.length === 2) {
          this.placePipe(...tempPipes);
          this.increaseScore();
          this.saveBestScore();
          this.increaseDifficulty();
        }
      }
    })

    this.coins.getChildren().forEach(coin => {
      if (coin.getBounds().right <= 0) {
        coin.body.reset(99999,99999)
        coin.disableBody(false, false);
      }
    })
  }

  increaseDifficulty() {
    if (this.score === 1) {
      this.currentDifficulty = 'normal';
    }

    if (this.score === 3) {
      this.currentDifficulty = 'hard';
    }
  }

  getRightMostPipe() {
    let rightMostX = 0;

    this.pipes.getChildren().forEach(function(pipe) {
      rightMostX = Math.max(pipe.x, rightMostX);
    })

    return rightMostX;
  }

  saveBestScore() {
    const bestScoreText = localStorage.getItem('bestScore');
    const bestScore = bestScoreText && parseInt(bestScoreText, 10);

    if (!bestScore || this.score > bestScore) {
      localStorage.setItem('bestScore', this.score);
    }
  }

  gameOver() {
    this.physics.pause();
    this.bird.setTint(0xEE4824);

    this.saveBestScore();

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.scene.restart();
      },
      loop: false
    })
  }

  flap() {
    if (this.isPaused) { return; }
    this.bird.body.velocity.y = -this.flapVelocity * this.scaleRatio;
  }

  increaseScore() {
    this.score++;
    this.scoreText.setText(`Score: ${this.score}`)
  }
}

export default PlayScene;


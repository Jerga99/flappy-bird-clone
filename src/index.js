

import Phaser from 'phaser';

import PlayScene from './scenes/PlayScene';
import MenuScene from './scenes/MenuScene';
import PreloadScene from './scenes/PreloadScene';

const WIDTH = 800;
const HEIGHT = 600;
const BIRD_POSITION = {x: WIDTH * 0.1, y: HEIGHT / 2 };

const SHARED_CONFIG = {
  width: WIDTH,
  height: HEIGHT,
  startPosition: BIRD_POSITION
}

const config = {
  type: Phaser.AUTO,
  ...SHARED_CONFIG,
  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
    }
  },
  scene: [PreloadScene, new MenuScene(SHARED_CONFIG), new PlayScene(SHARED_CONFIG)]
}

new Phaser.Game(config);

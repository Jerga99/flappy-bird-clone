
import Phaser from 'phaser';

class BaseScene extends Phaser.Scene {

  constructor(key, config) {
    super(key);
    this.config = config;
    this.fontSize = 34;
    this.lineHeight = 42;
    this.fontOptions = {fontSize: `${this.fontSize}px`, fill: '#fff'};
  }

  create() {
    // can adjust depending on screen size
    this.scaleRatio = 1;

    if (!this.game.device.os.desktop){
      this.scaleRatio = window.devicePixelRatio
    }

    const canvas	= document.getElementsByTagName('canvas')[0];
    this.screenCenter = [canvas.width / 2, canvas.height / 2];
    this.add.image(0, 0, 'sky')
      .setScale(3 * this.scaleRatio)
      .setOrigin(0);

    if (this.config.canGoBack) {
      const backButton = this.add.image(this.config.width - 10, this.config.height -10, 'back')
        .setOrigin(1)
        .setScale(2)
        .setInteractive()

      backButton.on('pointerup', () => {
        this.scene.start('MenuScene');
      })
    }
  }

  createMenu(menu, setupMenuEvents) {
    let lastMenuPositionY = 0;

    menu.forEach(menuItem => {
      const menuPosition = [this.screenCenter[0], this.screenCenter[1] + lastMenuPositionY];
      menuItem.textGO = this.add.text(...menuPosition, menuItem.text, this.fontOptions).setOrigin(0.5, 1);
      lastMenuPositionY += this.lineHeight;
      setupMenuEvents(menuItem);
    })
  }
}

export default BaseScene;

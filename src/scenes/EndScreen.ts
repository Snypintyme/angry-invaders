import * as Phaser from 'phaser';

export default class EndScreen extends Phaser.Scene {
  score: number;
  restartText: Phaser.GameObjects.Text;

  constructor() {
    super({
      key: 'EndScreen',
    });
  }

  init(data) {
    this.score = data?.score;
  }

  create() {
    this.add
      .text(760, 300, 'GAME OVER!')
      .setFontSize(60)
      .setFontFamily('Comic Sans MS')
      .setColor('#000000')
      .disableInteractive();

    this.add
      .text(840, 500, `Score: ${this.score}`)
      .setFontSize(40)
      .setFontFamily('Comic Sans MS')
      .setColor('#000000')
      .disableInteractive();

    this.restartText = this.add
      .text(835, 700, 'Restart')
      .setFontSize(50)
      .setFontFamily('Comic Sans MS')
      .setColor('#000000')
      .setInteractive()
      .on('pointerdown', () => this.scene.start('Game'))
      .on('pointerover', () => this.restartText.setColor('#ff0000'))
      .on('pointerout', () => this.restartText.setColor('#000000'));
  }
}

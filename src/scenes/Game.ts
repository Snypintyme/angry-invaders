import * as Phaser from 'phaser';

export default class Game extends Phaser.Scene {
  lightning: Phaser.GameObjects.Sprite;
  arrow: Phaser.GameObjects.Polygon;
  lightningMoving: boolean;
  indicatorLine: Phaser.GameObjects.Line;
  lightningInitialX: number;
  lightningInitialY: number;
  dragX: number;
  dragY: number;
  velocityX: number;
  velocityY: number;
  score: number;
  scoreText: Phaser.GameObjects.Text;
  enemies: Phaser.GameObjects.Sprite[];
  zaps: Phaser.GameObjects.Image[];
  instructions: Phaser.GameObjects.Text;
  gameTimer: number;

  constructor() {
    super({
      key: 'Game',
    });
  }

  init() {
    this.lightningInitialX = 960;
    this.lightningInitialY = 800;
    this.lightningMoving = false;
    this.dragX = 0;
    this.dragY = 0;
    this.score = 0;
    this.enemies = [];
    this.zaps = [];
    this.gameTimer = 0;
  }

  preload() {
    this.load.image('lightning', 'assets/lightning.png');
    this.load.image('ghost1', 'assets/ghost1.png');
    this.load.image('ghost2', 'assets/ghost2.png');
    this.load.image('finishLine', 'assets/finishLine.jpg');
    this.load.image('zap', 'assets/zap.png');
  }

  getRandomEnemySpawnX() {
    return Math.random() * 1820 + 50;
  }

  getRandomEnemySpawnY() {
    return -(Math.random() * 980 + 50);
  }

  createGhost() {
    this.enemies.push(
      this.add
        .sprite(this.getRandomEnemySpawnX(), this.getRandomEnemySpawnY(), 'ghost1')
        .disableInteractive()
        .setData({ animationCount: 0, animationImage: 1 })
    );
  }

  create() {
    this.add.image(this.lightningInitialX, this.lightningInitialY, 'finishLine');

    this.instructions = this.add
      .text(400, 350, 'Zap the ghosts before they cross the finish line!')
      .setFontSize(50)
      .setFontFamily('Comic Sans MS')
      .setColor('#000000')
      .disableInteractive();

    this.lightning = this.add.sprite(this.lightningInitialX, this.lightningInitialY, 'lightning').setInteractive();

    this.arrow = this.add
      .polygon(
        this.lightningInitialX,
        this.lightningInitialY,
        [
          [10, -30],
          [10, -80],
          [0, -80],
          [20, -100],
          [40, -80],
          [30, -80],
          [30, -30],
        ],
        0x000000
      )
      .setVisible(false)
      .disableInteractive();

    this.scoreText = this.add
      .text(50, 50, `Score: ${this.score}`)
      .setFontSize(30)
      .setFontFamily('Comic Sans MS')
      .setColor('#000000')
      .disableInteractive();

    for (let i = 0; i < 3; ++i) {
      this.createGhost();
    }

    this.input.on('pointerdown', (pointer, targets) => {
      if (targets.length > 0) {
        this.arrow.setVisible(true);
        this.input.on('pointermove', (pointer) => {
          this.dragX = this.lightningInitialX - pointer.x;
          this.dragY = this.lightningInitialY - pointer.y;
        });
        this.input.on('pointerup', () => {
          console.log('pointer up');
          this.velocityX = this.dragX;
          this.velocityY = this.dragY;
          this.dragX = 0;
          this.dragY = 0;
          this.lightningMoving = true;
          this.arrow.setVisible(false);
          this.input.off('pointermove');
          this.input.off('pointerup');
          this.instructions.setVisible(false);
        });
      }
    });
  }

  update() {
    // Update game
    this.gameTimer++;
    if (this.gameTimer % (60 * 30) == 0) {
      this.createGhost();
    }

    // Update enemies
    for (let i = 0; i < this.enemies.length; ++i) {
      this.enemies[i].y += 0.5;
      if (this.enemies[i].getCenter().y > this.lightningInitialY) {
        this.scene.start('EndScreen', {
          score: this.score,
        });
      }

      const data = {
        animationCount: this.enemies[i].getData('animationCount') + 1,
        animationImage: this.enemies[i].getData('animationImage'),
      };
      if (data.animationCount >= 100) {
        data.animationCount = 0;
        data.animationImage = data.animationImage === 1 ? 2 : 1;
        this.enemies[i].setTexture(`ghost${data.animationImage}`);
      }
      this.enemies[i].setData(data);
    }

    // Update Zaps
    for (let i = 0; i < this.zaps.length; ++i) {
      const aliveCount = this.zaps[i].getData('aliveCount');
      if (aliveCount > 100) {
        const destroyedZaps = this.zaps.splice(i, 1);
        destroyedZaps[0].destroy();
      } else {
        this.zaps[i].setData({
          aliveCount: aliveCount + 1,
        });
      }
    }

    // Rotations
    if (this.dragX !== 0 && this.dragY !== 0) {
      this.arrow.setRotation(Math.atan2(this.dragY, this.dragX) + Math.PI / 2);
      this.lightning.setRotation(Math.atan2(this.dragY, this.dragX) + (Math.PI * 75) / 180);
    }

    // Update Lightning
    if (this.lightningMoving) {
      this.lightning.x += this.velocityX / 50;
      this.lightning.y += this.velocityY / 50;
      const top = this.lightning.getTopCenter().y;
      const bottom = this.lightning.getBottomCenter().y;
      const left = this.lightning.getLeftCenter().x;
      const right = this.lightning.getRightCenter().x;

      // Out of bounds
      if (left > 1920 || right < 0 || top > 1080 || bottom < 0) {
        this.lightningMoving = false;
        this.lightning.x = this.lightningInitialX;
        this.lightning.y = this.lightningInitialY;
      }

      // Hit enemy
      for (let i = 0; i < this.enemies.length; ++i) {
        const enemyTop = this.enemies[i].getTopCenter().y;
        const enemyBottom = this.enemies[i].getBottomCenter().y;
        const enemyLeft = this.enemies[i].getLeftCenter().x;
        const enemyRight = this.enemies[i].getRightCenter().x;

        if (
          (top > enemyTop && top < enemyBottom) ||
          (bottom > enemyTop && bottom < enemyBottom) ||
          (top < enemyTop && bottom > enemyBottom)
        ) {
          if (
            (left > enemyLeft && left < enemyRight) ||
            (right > enemyLeft && right < enemyRight) ||
            (left < enemyLeft && right > enemyRight)
          ) {
            this.score += 10;
            this.scoreText.text = `Score: ${this.score}`;
            this.zaps.push(
              this.add
                .image(this.enemies[i].x, this.enemies[i].y, 'zap')
                .disableInteractive()
                .setScale(0.5, 0.5)
                .setData({ aliveCount: 0 })
            );
            this.enemies[i].x = this.getRandomEnemySpawnX();
            this.enemies[i].y = this.getRandomEnemySpawnY();
          }
        }
      }
    }
  }
}

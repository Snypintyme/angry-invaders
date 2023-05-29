import * as Phaser from 'phaser';
import Game from './scenes/Game';
import EndScreen from './scenes/EndScreen';

const config = {
  type: Phaser.AUTO,
  antialias: true,
  autoCenter: Phaser.Scale.CENTER_BOTH,
  backgroundColor: '#ffffff',
  width: 1920,
  height: 1080,
  scale: {
    mode: Phaser.Scale.FIT,
  },
  scene: [Game, EndScreen],
};

const game = new Phaser.Game(config);

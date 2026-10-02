// ============================================================
// main.js
// Ponto de entrada do jogo. Configura e inicia o Phaser.
// ============================================================
import Phaser from 'phaser';
import { BootScene }     from './scenes/BootScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { GameScene }     from './scenes/GameScene.js';

const config = {
  type: Phaser.AUTO,
  width:  1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#000000',

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },  // Top-down: sem gravidade
      debug: false,
    },
  },

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  scene: [BootScene, MainMenuScene, GameScene],
};

const game = new Phaser.Game(config);

// Expõe globalmente para debug em desenvolvimento
if (import.meta.env.DEV) {
  window.__ABISMO_GAME__ = game;
}

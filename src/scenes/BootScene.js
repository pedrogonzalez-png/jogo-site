// ============================================================
// scenes/BootScene.js
// Gera texturas programáticas (sem assets externos).
// ============================================================
import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this._createLoadingScreen();
  }

  create() {
    this._generateTextures();
    this.scene.start("MainMenuScene");
  }

  _createLoadingScreen() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000);
    this.add
      .text(W / 2, H / 2, "Carregando...", {
        fontFamily: "Cinzel",
        fontSize: "24px",
        color: "#ffddaa",
      })
      .setOrigin(0.5);
  }

  _generateTextures() {
    this._genPlayer();
    this._genEnemy();
    this._genBoss();
    this._genParticle();
    this._genSanctuary();
    this._genChest();
    this._genXPOrb();
    this._genPortal();
    this._genTiles();
  }

  _genPlayer() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Corpo
    g.fillStyle(0xddccaa);
    g.fillRect(4, 8, 24, 20);
    // Cabeça
    g.fillStyle(0xeecc99);
    g.fillCircle(16, 8, 8);
    // Olhos
    g.fillStyle(0x222222);
    g.fillCircle(19, 6, 2);
    g.fillCircle(13, 6, 2);
    // Espada simples
    g.fillStyle(0xaaaacc);
    g.fillRect(26, 10, 3, 14);
    g.fillStyle(0x8b6914);
    g.fillRect(24, 10, 6, 3);
    g.generateTexture("player", 32, 32);
    g.destroy();
  }

  _genEnemy() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x884422);
    g.fillRect(5, 10, 22, 18);
    g.fillStyle(0x993311);
    g.fillCircle(16, 10, 7);
    g.fillStyle(0xffaa00);
    g.fillRect(12, 7, 4, 3);
    g.fillRect(18, 7, 4, 3);
    g.generateTexture("enemy", 32, 32);
    g.destroy();
  }

  _genBoss() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x661100);
    g.fillRect(2, 6, 28, 24);
    g.fillStyle(0x880000);
    g.fillCircle(16, 8, 10);
    g.fillStyle(0xff2200);
    g.fillRect(8, 3, 6, 5);
    g.fillRect(18, 3, 6, 5);
    g.fillStyle(0xff8800);
    g.fillRect(11, 6, 3, 3);
    g.fillRect(18, 6, 3, 3);
    g.generateTexture("boss", 32, 32);
    g.destroy();
  }

  _genParticle() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture("particle", 8, 8);
    g.destroy();
  }

  _genSanctuary() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Base
    g.fillStyle(0x1a1a3a);
    g.fillRect(2, 8, 28, 20);
    // Chama
    g.fillStyle(0xff8800);
    g.fillTriangle(16, 2, 10, 16, 22, 16);
    g.fillStyle(0xffff00);
    g.fillTriangle(16, 6, 12, 14, 20, 14);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(16, 14, 3);
    // Bordas
    g.lineStyle(1, 0x4444aa);
    g.strokeRect(2, 8, 28, 20);
    g.generateTexture("sanctuary", 32, 32);
    g.destroy();
  }

  _genChest() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x8b4513);
    g.fillRect(4, 12, 24, 16);
    g.fillStyle(0xaa6622);
    g.fillRect(4, 12, 24, 6);
    g.lineStyle(1, 0x5c3006);
    g.strokeRect(4, 12, 24, 16);
    g.fillStyle(0xffcc00);
    g.fillRect(14, 17, 4, 4);
    g.generateTexture("chest", 32, 32);
    g.destroy();
  }

  _genXPOrb() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffcc00, 0.9);
    g.fillCircle(6, 6, 6);
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(4, 4, 2);
    g.generateTexture("xporb", 12, 12);
    g.destroy();
  }

  _genPortal() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x330055, 0.9);
    g.fillCircle(24, 24, 22);
    g.fillStyle(0x6600aa, 0.8);
    g.fillCircle(24, 24, 16);
    g.fillStyle(0xaa22ff, 0.9);
    g.fillCircle(24, 24, 10);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(24, 24, 4);
    g.lineStyle(2, 0xdd88ff, 0.8);
    g.strokeCircle(24, 24, 22);
    g.generateTexture("portal", 48, 48);
    g.destroy();
  }

  _genTiles() {
    const T = 32;

    // Chão
    const floor = this.make.graphics({ x: 0, y: 0, add: false });
    floor.fillStyle(0x3a3028);
    floor.fillRect(0, 0, T, T);
    floor.lineStyle(0.5, 0x2a2018, 0.3);
    floor.strokeRect(0, 0, T, T);
    // Variação
    if (Math.random() > 0.6) {
      floor.fillStyle(0x2e2418, 0.4);
      floor.fillRect(2, 2, 8, 8);
    }
    floor.generateTexture("tile_floor", T, T);
    floor.destroy();

    // Parede
    const wall = this.make.graphics({ x: 0, y: 0, add: false });
    wall.fillStyle(0x1a140f);
    wall.fillRect(0, 0, T, T);
    wall.fillStyle(0x2a1e16, 0.6);
    wall.fillRect(2, 2, T - 4, 8);
    wall.lineStyle(1, 0x0d0a07, 0.8);
    wall.strokeRect(0, 0, T, T);
    wall.generateTexture("tile_wall", T, T);
    wall.destroy();

    // Obstáculo
    const obs = this.make.graphics({ x: 0, y: 0, add: false });
    obs.fillStyle(0x2a1a10);
    obs.fillRect(4, 4, T - 8, T - 8);
    obs.fillStyle(0x3a2a1e, 0.5);
    obs.fillRect(4, 4, T - 8, 6);
    obs.lineStyle(1, 0x1a0f07);
    obs.strokeRect(4, 4, T - 8, T - 8);
    obs.generateTexture("tile_obstacle", T, T);
    obs.destroy();

    // Porta (passagem)
    const door = this.make.graphics({ x: 0, y: 0, add: false });
    door.fillStyle(0x4a3828);
    door.fillRect(0, 0, T, T);
    door.fillStyle(0x5a4838, 0.6);
    door.fillRect(4, 4, T - 8, T - 8);
    door.generateTexture("tile_door", T, T);
    door.destroy();

    // Santuário tile
    const sanc = this.make.graphics({ x: 0, y: 0, add: false });
    sanc.fillStyle(0x3a3028);
    sanc.fillRect(0, 0, T, T);
    sanc.fillStyle(0x1a1a3a, 0.5);
    sanc.fillCircle(T / 2, T / 2, T / 2 - 2);
    sanc.generateTexture("tile_sanctuary", T, T);
    sanc.destroy();
  }
}

// ============================================================
// scenes/MainMenuScene.js
// Menu principal com seed, novo jogo e continuar.
// ============================================================
import Phaser from 'phaser';
import { SaveSystem } from '../save/SaveSystem.js';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
    this._saveSystem = new SaveSystem();
    this._saves = [];
  }

  async create() {
    await this._saveSystem.init();
    this._saves = await this._saveSystem.listSlots().catch(() => []);

    const W = this.cameras.main.width;
    const H = this.cameras.main.height;

    this.cameras.main.setBackgroundColor(0x020101);

    // ── Fundo animado ─────────────────────────────────────────
    this._buildBackground(W, H);

    // ── Título ────────────────────────────────────────────────
    this.add.text(W / 2, H * 0.14, 'ABISMO', {
      fontFamily: 'Cinzel', fontSize: '72px', color: '#ffddaa',
      stroke: '#330000', strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.24, 'Um RPG de ação sobre risco, descoberta e poder.', {
      fontFamily: 'Inter', fontSize: '14px', color: '#886666', fontStyle: 'italic',
    }).setOrigin(0.5);

    // ── Seed ─────────────────────────────────────────────────
    const seedLabel = this.add.text(W / 2 - 120, H * 0.38, 'SEED:', {
      fontFamily: 'Cinzel', fontSize: '14px', color: '#aaaaaa',
    });

    // Seed input (DOM)
    this._seedValue = String(Math.floor(Math.random() * 999999) + 1);
    this._seedText = this.add.text(W / 2 - 60, H * 0.38, this._seedValue, {
      fontFamily: 'Cinzel', fontSize: '16px', color: '#ffdd88',
      backgroundColor: '#111111', padding: { x: 8, y: 4 },
    }).setInteractive();

    const randomBtn = this.add.text(W / 2 + 100, H * 0.38, '[?]', {
      fontFamily: 'Cinzel', fontSize: '16px', color: '#44aaff',
    }).setInteractive().on('pointerup', () => {
      this._seedValue = String(Math.floor(Math.random() * 999999) + 1);
      this._seedText.setText(this._seedValue);
    });

    // ── Botões ────────────────────────────────────────────────
    this._buildButton(W / 2, H * 0.50, 'NOVO JOGO', '#ffddaa', () => {
      this._startGame(this._seedValue, false);
    });

    if (this._saves.length > 0) {
      const latest = this._saves.sort((a, b) => b.timestamp - a.timestamp)[0];
      this._buildButton(W / 2, H * 0.60,
        `CONTINUAR  (Nv.${latest.level} | Seed: ${latest.seed})`,
        '#88ddff', () => this._startGame(latest.seed, true, latest.slot)
      );
    }

    // ── Controles ─────────────────────────────────────────────
    this.add.text(W / 2, H * 0.82,
      'WASD / Setas: Mover  |  Z: Ataque  |  X: Ataque Pesado  |  C: Esquiva  |  V: Parry  |  F: Bloquear\n' +
      'E: Habilidade  |  Q: Curar  |  TAB: Inventário  |  Shift: Correr',
      { fontFamily: 'Inter', fontSize: '11px', color: '#555555', align: 'center', lineSpacing: 6 }
    ).setOrigin(0.5);
  }

  _buildButton(x, y, label, color, callback) {
    const btn = this.add.text(x, y, label, {
      fontFamily: 'Cinzel', fontSize: '20px', color,
      stroke: '#000', strokeThickness: 3,
      backgroundColor: '#111111',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive();

    btn.on('pointerover', () => btn.setAlpha(0.8));
    btn.on('pointerout',  () => btn.setAlpha(1));
    btn.on('pointerup',   callback);
    return btn;
  }

  _buildBackground(W, H) {
    // Partículas de cinzas caindo
    this.add.rectangle(W / 2, H / 2, W, H, 0x050302);

    for (let i = 0; i < 60; i++) {
      const p = this.add.circle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        Phaser.Math.Between(1, 3),
        0x554433,
        Phaser.Math.FloatBetween(0.1, 0.5)
      );
      this.tweens.add({
        targets: p,
        y: '+=400',
        x: `+=${Phaser.Math.Between(-60, 60)}`,
        alpha: { from: 0, to: 0.4 },
        duration: Phaser.Math.Between(4000, 9000),
        repeat: -1,
        yoyo: false,
        delay: Phaser.Math.Between(0, 5000),
        onRepeat: () => {
          p.setPosition(Phaser.Math.Between(0, W), -10);
        },
      });
    }

    // Linha divisória decorativa
    const line = this.add.graphics();
    line.lineStyle(1, 0x554433, 0.4);
    line.lineBetween(W * 0.2, H * 0.32, W * 0.8, H * 0.32);
  }

  _startGame(seed, loadSave = false, slot = 0) {
    this.scene.start('GameScene', {
      seed: String(seed),
      loadSave,
      slot,
      saveSystem: this._saveSystem,
    });
  }
}

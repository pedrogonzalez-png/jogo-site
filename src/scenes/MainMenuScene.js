// ============================================================
// scenes/MainMenuScene.js
// Menu principal com estética ASCII art.
// ============================================================
import Phaser from 'phaser';
import { SaveSystem } from '../save/SaveSystem.js';

const MONO = '"Courier New", "Consolas", monospace';

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

    this.cameras.main.setBackgroundColor(0x000000);

    // ── Fundo com ASCII characters caindo ──────────────────
    this._buildBackground(W, H);

    // ── Bordas decorativas ─────────────────────────────────
    const borderTop    = '╔' + '═'.repeat(72) + '╗';
    const borderBottom = '╚' + '═'.repeat(72) + '╝';

    this.add.text(W / 2, H * 0.06, borderTop, {
      fontFamily: MONO, fontSize: '12px', color: '#443322',
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.94, borderBottom, {
      fontFamily: MONO, fontSize: '12px', color: '#443322',
    }).setOrigin(0.5);

    // Barras laterais
    for (let i = 0; i < 14; i++) {
      const yPos = H * 0.08 + i * (H * 0.86 / 14);
      this.add.text(W * 0.12, yPos, '║', {
        fontFamily: MONO, fontSize: '12px', color: '#332211',
      }).setOrigin(0.5);
      this.add.text(W * 0.88, yPos, '║', {
        fontFamily: MONO, fontSize: '12px', color: '#332211',
      }).setOrigin(0.5);
    }

    // ── Título ASCII ───────────────────────────────────────
    const title = [
      "  ▄▄▄       ▄▄▄▄·  ▪  .▄▄ · • ▌ ▄ ·.        ",
      " ▐█ ▀█     ▐█ ▀█▪ ██ ▐█ ▀. ·██ ▐███▪▪       ",
      " ▄█▀▀█     ▐█▀▀█▄ ▐█·▄▀▀▀█▄▐█ ▌▐▌▐█· ▄█▀▄  ",
      " ▐█ ▪▐▌    ██▄▪▐█ ▐█▌▐█▄▪▐███ ██▌▐█▌▐█▌.▐▌ ",
      "  ▀  ▀     ·▀▀▀▀  ▀▀▀ ▀▀▀▀ ▀▀  █▪▀▀▀ ▀█▄▀▪ ",
    ];

    title.forEach((line, i) => {
      const t = this.add.text(W / 2, H * 0.12 + i * 18, line, {
        fontFamily: MONO, fontSize: '14px', color: '#aa6633',
      }).setOrigin(0.5);

      // Efeito de pulso sutil no título
      this.tweens.add({
        targets: t,
        alpha: { from: 0.6, to: 1 },
        duration: 2000 + i * 300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });

    // ── Subtítulo ──────────────────────────────────────────
    this.add.text(W / 2, H * 0.29, '~ Um RPG de ação sobre risco, descoberta e poder ~', {
      fontFamily: MONO, fontSize: '11px', color: '#665544', fontStyle: 'italic',
    }).setOrigin(0.5);

    // ── Linha divisória ─────────────────────────────────────
    const divider = '─'.repeat(40);
    this.add.text(W / 2, H * 0.33, divider, {
      fontFamily: MONO, fontSize: '12px', color: '#443322',
    }).setOrigin(0.5);

    // ── Seed ─────────────────────────────────────────────────
    this._seedValue = String(Math.floor(Math.random() * 999999) + 1);
    this.add.text(W / 2 - 100, H * 0.39, '> SEED:', {
      fontFamily: MONO, fontSize: '14px', color: '#888888',
    });

    this._seedText = this.add.text(W / 2 - 15, H * 0.39, this._seedValue, {
      fontFamily: MONO, fontSize: '14px', color: '#ffdd88',
      backgroundColor: '#111100',
      padding: { x: 6, y: 2 },
    }).setInteractive();

    const randomBtn = this.add.text(W / 2 + 85, H * 0.39, '[?]', {
      fontFamily: MONO, fontSize: '14px', color: '#4488aa',
    }).setInteractive().on('pointerup', () => {
      this._seedValue = String(Math.floor(Math.random() * 999999) + 1);
      this._seedText.setText(this._seedValue);
    });
    randomBtn.on('pointerover', () => randomBtn.setColor('#66ccff'));
    randomBtn.on('pointerout',  () => randomBtn.setColor('#4488aa'));

    // ── Botões ────────────────────────────────────────────────
    this._buildButton(W / 2, H * 0.50, '> NOVO JOGO <', '#ffddaa', () => {
      this._startGame(this._seedValue, false);
    });

    if (this._saves.length > 0) {
      const latest = this._saves.sort((a, b) => b.timestamp - a.timestamp)[0];
      this._buildButton(W / 2, H * 0.58,
        `> CONTINUAR  [Nv.${latest.level} | Seed: ${latest.seed}] <`,
        '#88ddff', () => this._startGame(latest.seed, true, latest.slot)
      );
    }

    // ── Controles ─────────────────────────────────────────────
    const controls = [
      '┌──────────────────────────────────────────────────────────┐',
      '│  WASD/Setas: Mover   Shift: Correr   C: Esquiva        │',
      '│  Z: Ataque   X: Pesado   V: Parry    F: Bloquear       │',
      '│  E: Habilidade   Q: Curar   TAB: Inventário   G: Ação  │',
      '└──────────────────────────────────────────────────────────┘',
    ];

    controls.forEach((line, i) => {
      this.add.text(W / 2, H * 0.72 + i * 14, line, {
        fontFamily: MONO, fontSize: '10px', color: '#444444',
      }).setOrigin(0.5);
    });

    // ── Ilustração do Cavaleiro de Referência em Alta Resolução ──
    if (this.textures.exists('reference_knight_master')) {
      const knightBg = this.add.image(W * 0.80, H * 0.50, 'reference_knight_master')
        .setDepth(1)
        .setAlpha(0.70)
        .setScale(0.82);
      
      this.tweens.add({
        targets: knightBg,
        alpha: { from: 0.60, to: 0.80 },
        duration: 3000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // ── Rodapé ────────────────────────────────────────────────
    this.add.text(W / 2, H * 0.90, 'DIREÇÃO ARTÍSTICA ASCII DE ALTA DENSIDADE — Densidade, Volume e Sombra Construídos com Caracteres', {
      fontFamily: MONO, fontSize: '11px', color: '#887766',
    }).setOrigin(0.5);
  }

  _buildButton(x, y, label, color, callback) {
    const btn = this.add.text(x, y, label, {
      fontFamily: MONO, fontSize: '16px', color,
      stroke: '#000', strokeThickness: 2,
      padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setInteractive();

    const baseColor = color;
    btn.on('pointerover', () => {
      btn.setColor('#ffffff');
      btn.setScale(1.05);
    });
    btn.on('pointerout', () => {
      btn.setColor(baseColor);
      btn.setScale(1);
    });
    btn.on('pointerup', callback);
    return btn;
  }

  _buildBackground(W, H) {
    // Caracteres ASCII caindo como chuva no fundo
    const chars = '.·:;~^*°¨`\'"';
    for (let i = 0; i < 80; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const p = this.add.text(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        char,
        {
          fontFamily: MONO,
          fontSize: `${Phaser.Math.Between(8, 14)}px`,
          color: '#221100',
        }
      );

      this.tweens.add({
        targets: p,
        y: `+=${Phaser.Math.Between(200, 500)}`,
        alpha: { from: 0, to: 0.3 },
        duration: Phaser.Math.Between(5000, 12000),
        repeat: -1,
        yoyo: false,
        delay: Phaser.Math.Between(0, 6000),
        onRepeat: () => {
          p.setPosition(Phaser.Math.Between(0, W), -20);
          p.setText(chars[Math.floor(Math.random() * chars.length)]);
        },
      });
    }
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

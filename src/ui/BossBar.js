// ============================================================
// ui/BossBar.js
// Barra de HP do boss na parte superior da tela.
// ============================================================
import Phaser from 'phaser';

export class BossBar {
  constructor(scene) {
    this.scene = scene;
    this._boss = null;
    this._built = false;
  }

  show(boss) {
    this._boss = boss;
    if (!this._built) this._build();
    this._container.setVisible(true);
    this._nameText.setText(boss.template.name ?? 'Chefe Desconhecido');
    this._levelText.setText(`Nv. ${boss.level}`);
    this._descText.setText(boss.template.description ?? '');
    this._phaseText.setText('FASE I');

    // Animação de entrada
    this.scene.tweens.add({
      targets: this._container,
      alpha: 1,
      duration: 600,
    });
  }

  _build() {
    const s = this.scene;
    const W = s.cameras.main.width;

    this._container = s.add.container(W / 2, 30).setScrollFactor(0).setDepth(200).setAlpha(0);

    const barW = Math.min(W * 0.6, 600);

    const bg = s.add.rectangle(0, 0, barW + 8, 26, 0x000000, 0.8).setOrigin(0.5);
    this._barBg = s.add.rectangle(0, 0, barW, 18, 0x222222, 1).setOrigin(0.5);
    this._barFill = s.add.rectangle(-barW / 2, 0, barW, 18, 0xdd2200, 1).setOrigin(0, 0.5);
    this._nameText = s.add.text(0, -26, '', {
      fontFamily: 'Cinzel', fontSize: '16px', color: '#ffddaa',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);
    this._levelText = s.add.text(barW / 2 + 8, 0, '', {
      fontFamily: 'Inter', fontSize: '11px', color: '#aaaaaa',
    }).setOrigin(0, 0.5);
    this._phaseText = s.add.text(-barW / 2, 0, 'FASE I', {
      fontFamily: 'Cinzel', fontSize: '10px', color: '#ffaa44',
    }).setOrigin(0, 0.5);
    this._descText = s.add.text(0, 16, '', {
      fontFamily: 'Inter', fontSize: '10px', color: '#888888', fontStyle: 'italic',
    }).setOrigin(0.5);

    this._container.add([bg, this._barBg, this._barFill, this._nameText,
                         this._levelText, this._phaseText, this._descText]);
    this._built = true;
  }

  setPhase(phase) {
    this._phaseText?.setText(`FASE ${phase === 2 ? 'II' : 'I'}`);
    const barColor = phase === 2 ? 0xff6600 : 0xdd2200;
    this._barFill?.setFillStyle(barColor);
  }

  update() {
    if (!this._boss || !this._built) return;

    const barW = Math.min(this.scene.cameras.main.width * 0.6, 600);
    const pct  = Math.max(0, this._boss.hp / this._boss.maxHP);

    // Anima a barra
    const targetW = barW * pct;
    const currentW = this._barFill.displayWidth;
    const newW = Phaser.Math.Linear(currentW, targetW, 0.12);
    this._barFill.setDisplaySize(newW, 18);

    // Pulsa quando boss está em baixo HP
    if (pct < 0.3) {
      const pulse = 0.8 + Math.sin(Date.now() / 200) * 0.2;
      this._barFill.setAlpha(pulse);
    } else {
      this._barFill.setAlpha(1);
    }
  }

  hide() {
    if (!this._built) return;
    this.scene.tweens.add({
      targets: this._container,
      alpha: 0, duration: 800,
    });
    this._boss = null;
  }
}

// ============================================================
// ui/HUD.js
// HUD minimalista: HP, Stamina, Equilíbrio, Cura, Arma, XP.
// ============================================================
import { BALANCE } from '../data/balance.js';

const RARITY_COLORS = {
  COMMON:    0xaaaaaa,
  RARE:      0x4488ff,
  VERY_RARE: 0xaa44ff,
  EPIC:      0xff8800,
  LEGENDARY: 0xffdd00,
  UNIQUE:    0xff4488,
};

const RARITY_LABELS = {
  COMMON: 'Comum', RARE: 'Rara', VERY_RARE: 'Muito Rara',
  EPIC: 'Épica', LEGENDARY: 'Lendária', UNIQUE: 'Única',
};

export class HUD {
  constructor(scene) {
    this.scene = scene;
    this._texts = {};
    this._bars  = {};

    this._build();
    this._notifications = [];
  }

  _build() {
    const s = this.scene;
    const W = s.cameras.main.width;
    const H = s.cameras.main.height;

    // ── Painel inferior esquerdo ──────────────────────────────
    const panelX = 16;
    const panelY = H - 140;

    // Fundo semitransparente
    this._bg = s.add.rectangle(panelX + 140, panelY + 60, 295, 130, 0x000000, 0.65)
      .setScrollFactor(0).setDepth(100).setOrigin(0.5);

    // HP
    this._buildBar('hp', panelX, panelY, 260, 14, 0x22cc44, 'HP');

    // Stamina
    this._buildBar('stamina', panelX, panelY + 24, 260, 10, 0xddcc22, 'STA');

    // Equilíbrio (só mostra quando relevante)
    this._buildBar('balance', panelX, panelY + 42, 260, 8, 0x4488ff, 'EQL');
    this._bars.balance.bar.setVisible(false);
    this._bars.balance.bg.setVisible(false);
    this._bars.balance.label.setVisible(false);

    // ── Cargas de cura ────────────────────────────────────────
    this._healOrbs = [];
    for (let i = 0; i < 10; i++) {
      const orb = s.add.circle(panelX + 10 + i * 22, panelY + 70, 8, 0x22cc44, 0.9)
        .setScrollFactor(0).setDepth(101).setVisible(false);
      this._healOrbs.push(orb);
    }

    // ── Arma equipada ─────────────────────────────────────────
    this._weaponBox = s.add.rectangle(panelX + 20, panelY + 92, 38, 38, 0x222222, 0.8)
      .setScrollFactor(0).setDepth(100).setOrigin(0.5);

    this._weaponIcon = s.add.rectangle(panelX + 20, panelY + 92, 28, 6, 0xffffff, 0.9)
      .setScrollFactor(0).setDepth(101).setOrigin(0.5);

    this._weaponName = s.add.text(panelX + 46, panelY + 82,
      'Sem arma', { fontFamily: 'Inter', fontSize: '11px', color: '#cccccc' })
      .setScrollFactor(0).setDepth(101);

    this._skillBar = s.add.rectangle(panelX + 46, panelY + 103, 90, 6, 0x333333, 1)
      .setScrollFactor(0).setDepth(100).setOrigin(0, 0.5);

    this._skillFill = s.add.rectangle(panelX + 46, panelY + 103, 0, 6, 0xaa44ff, 1)
      .setScrollFactor(0).setDepth(101).setOrigin(0, 0.5);

    this._skillLabel = s.add.text(panelX + 46, panelY + 110,
      '', { fontFamily: 'Inter', fontSize: '9px', color: '#aa88ff' })
      .setScrollFactor(0).setDepth(101);

    // ── Nível e XP - canto superior esquerdo ─────────────────
    this._levelText = s.add.text(12, 12,
      'Nv. 1', { fontFamily: 'Cinzel', fontSize: '18px', color: '#ffdd88',
                  stroke: '#000', strokeThickness: 3 })
      .setScrollFactor(0).setDepth(101);

    this._xpText = s.add.text(12, 36,
      'XP: 0', { fontFamily: 'Inter', fontSize: '11px', color: '#aaaaaa' })
      .setScrollFactor(0).setDepth(101);

    this._xpBarBg = s.add.rectangle(12, 52, 150, 4, 0x333333, 0.8)
      .setScrollFactor(0).setDepth(100).setOrigin(0, 0.5);
    this._xpBar = s.add.rectangle(12, 52, 0, 4, 0xffcc00, 1)
      .setScrollFactor(0).setDepth(101).setOrigin(0, 0.5);

    // ── Controles - canto inferior direito ────────────────────
    const ctrlX = W - 190;
    const ctrlY = H - 130;
    this._controlsText = s.add.text(ctrlX, ctrlY,
      'WASD: Mover  Shift: Correr\nZ: Ataque  X: Pesado\nC: Esquiva  V: Parry\nF: Bloquear  E: Habilidade\nQ: Curar  TAB: Inventário',
      { fontFamily: 'Inter', fontSize: '9px', color: '#777777', lineSpacing: 3 })
      .setScrollFactor(0).setDepth(100);

    // ── Area de notificações ──────────────────────────────────
    this._notifContainer = s.add.container(W / 2, H / 2 - 80).setDepth(200).setScrollFactor(0);
  }

  _buildBar(key, x, y, width, height, color, label) {
    const s = this.scene;
    const bg   = s.add.rectangle(x, y, width, height, 0x111111, 0.8)
      .setScrollFactor(0).setDepth(100).setOrigin(0, 0);
    const bar  = s.add.rectangle(x, y, width, height, color, 0.9)
      .setScrollFactor(0).setDepth(101).setOrigin(0, 0);
    const lbl  = s.add.text(x + width + 4, y, label,
      { fontFamily: 'Inter', fontSize: '9px', color: '#888888' })
      .setScrollFactor(0).setDepth(101);

    this._bars[key] = { bg, bar, label: lbl, maxWidth: width };
  }

  // ── Atualização ──────────────────────────────────────────────
  update(player, systems) {
    if (!player) return;

    const { levelSystem, xpSystem } = systems;

    // HP
    const hpPct = player.hp / player.maxHP;
    this._bars.hp.bar.setDisplaySize(Math.max(0, this._bars.hp.maxWidth * hpPct), 14);
    const hpColor = hpPct > 0.5 ? 0x22cc44 : hpPct > 0.25 ? 0xddcc22 : 0xcc2222;
    this._bars.hp.bar.setFillStyle(hpColor);

    // Stamina
    const staPct = player.staminaSystem.percentage;
    this._bars.stamina.bar.setDisplaySize(Math.max(0, this._bars.stamina.maxWidth * staPct), 10);

    // Equilíbrio (mostra só quando parcialmente danificado)
    const balPct = player.balanceSystem.percentage;
    const showBal = balPct < 0.9 || player.balanceSystem.isStaggered;
    this._bars.balance.bar.setVisible(showBal);
    this._bars.balance.bg.setVisible(showBal);
    this._bars.balance.label.setVisible(showBal);
    if (showBal) {
      this._bars.balance.bar.setDisplaySize(Math.max(0, this._bars.balance.maxWidth * balPct), 8);
      const balColor = player.balanceSystem.isStaggered ? 0xff4444 : 0x4488ff;
      this._bars.balance.bar.setFillStyle(balColor);
    }

    // Cargas de cura
    for (let i = 0; i < this._healOrbs.length; i++) {
      const orb = this._healOrbs[i];
      if (i < player.maxHealCharges) {
        orb.setVisible(true);
        orb.setFillStyle(i < player.healCharges ? 0x22cc44 : 0x334433, i < player.healCharges ? 0.9 : 0.4);
      } else {
        orb.setVisible(false);
      }
    }

    // Arma
    if (player.weaponSystem.equipped) {
      const w = player.weaponSystem.equipped;
      const rColor = RARITY_COLORS[player.weaponSystem.effectiveRarity] ?? 0xffffff;
      this._weaponIcon.setFillStyle(rColor);
      this._weaponName.setText(`${w.name} +${w.upgradeLevel ?? 0}`).setColor(
        '#' + rColor.toString(16).padStart(6, '0')
      );

      // Skill cooldown
      if (player.weaponSystem.hasSkill) {
        const pct = player.weaponSystem.skillCooldownPct;
        this._skillFill.setDisplaySize(90 * pct, 6);
        const skill = player.weaponSystem.equipped.skill;
        this._skillLabel.setText(player.weaponSystem.skillReady ? `[E] ${skill.name}` : '...');
      }
    }

    // Nível e XP
    const lvl = levelSystem.level;
    this._levelText.setText(`Nv. ${lvl}`);

    const xpNeeded = levelSystem.xpForNextLevel;
    const xpHave   = xpSystem.stored;
    const xpPct    = Math.min(1, xpHave / xpNeeded);
    this._xpBar.setDisplaySize(150 * xpPct, 4);
    this._xpText.setText(`XP: ${this._fmt(xpHave)} / ${this._fmt(xpNeeded)}`);
  }

  _fmt(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
    return Math.floor(n).toString();
  }

  showNotification(text, color = '#ffffff', duration = 2500) {
    const s = this.scene;
    const W = s.cameras.main.width;
    const H = s.cameras.main.height;

    const t = s.add.text(W / 2, H * 0.38, text, {
      fontFamily: 'Cinzel', fontSize: '20px', color,
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

    s.tweens.add({
      targets: t,
      alpha: 1, y: H * 0.34,
      duration: 300,
      onComplete: () => {
        s.time.delayedCall(duration, () => {
          s.tweens.add({ targets: t, alpha: 0, duration: 400, onComplete: () => t.destroy() });
        });
      },
    });
  }

  showDamageNumber(x, y, amount, isCrit = false, isHeal = false) {
    const s = this.scene;
    const color = isHeal ? '#22ff66' : isCrit ? '#ffdd00' : '#ffffff';
    const size  = isCrit ? '22px' : '16px';
    const text  = isHeal ? `+${Math.floor(amount)}` : `-${Math.floor(amount)}`;

    const t = s.add.text(x, y - 20, text, {
      fontFamily: 'Inter', fontSize: size, color,
      fontStyle: isCrit ? 'bold' : 'normal',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(150);

    s.tweens.add({
      targets: t,
      y: y - 60, alpha: 0,
      duration: 900,
      ease: 'Power2',
      onComplete: () => t.destroy(),
    });
  }

  showAbyssReward(reward) {
    const lines = [
      `⚠ DESAFIO DO ABISMO — Tier ${reward.tier}`,
      `Diferença de nível: +${reward.diff}`,
      `+${reward.bonusPoints} pontos de atributo`,
      reward.itemTier ? `Drop: ${RARITY_LABELS[reward.itemTier] ?? reward.itemTier}` : '',
    ].filter(Boolean).join('\n');

    this.showNotification(lines, '#aa88ff', 5000);
  }

  destroy() {
    Object.values(this._bars).forEach(b => { b.bg?.destroy(); b.bar?.destroy(); b.label?.destroy(); });
    this._healOrbs.forEach(o => o.destroy());
    this._bg?.destroy();
    this._levelText?.destroy();
    this._xpText?.destroy();
    this._xpBar?.destroy();
    this._xpBarBg?.destroy();
    this._controlsText?.destroy();
    this._notifContainer?.destroy();
    this._weaponBox?.destroy();
    this._weaponIcon?.destroy();
    this._weaponName?.destroy();
    this._skillBar?.destroy();
    this._skillFill?.destroy();
    this._skillLabel?.destroy();
  }
}

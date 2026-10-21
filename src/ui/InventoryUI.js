// ============================================================
// ui/InventoryUI.js
// Interface de inventário, equipamento e upgrades.
// ============================================================
import { UpgradeSystem } from '../equipment/UpgradeSystem.js';
import { XPSystem } from '../progression/XPSystem.js';
import { ITEMS } from '../data/items.js';

const RARITY_COLORS = {
  COMMON: '#aaaaaa', RARE: '#4488ff', VERY_RARE: '#aa44ff',
  EPIC: '#ff8800', LEGENDARY: '#ffdd00', UNIQUE: '#ff4488',
};

export class InventoryUI {
  constructor(scene) {
    this.scene  = scene;
    this.visible = false;
    this._elements = [];
    this._panel = null;
  }

  toggle(player, systems) {
    if (this.visible) this.close();
    else this.open(player, systems);
  }

  open(player, systems) {
    this.visible = true;
    this._render(player, systems);
  }

  close() {
    this.visible = false;
    this._clear();
  }

  _clear() {
    this._elements.forEach(e => e.destroy());
    this._elements = [];
  }

  _render(player, systems) {
    this._clear();
    const s = this.scene;
    const W = s.cameras.main.width;
    const H = s.cameras.main.height;

    // Fundo semitransparente escuro
    const bg = s.add.rectangle(W / 2, H / 2, W * 0.94, H * 0.92, 0x080808, 0.96)
      .setScrollFactor(0).setDepth(300).setInteractive();
    this._elements.push(bg);

    // Título
    const title = s.add.text(W / 2, 34, 'INVENTÁRIO & PROGRESSÃO', {
      fontFamily: 'Cinzel', fontSize: '20px', color: '#ffddaa',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    this._elements.push(title);

    // Fechar
    const closeBtn = s.add.text(W - 48, 34, '✕', {
      fontFamily: 'Cinzel', fontSize: '22px', color: '#ff4444',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setInteractive();
    closeBtn.on('pointerup', () => this.close());
    this._elements.push(closeBtn);

    // Layout em 3 colunas
    const col1X = 45;
    const col2X = W * 0.38;
    const col3X = W * 0.69;

    this._renderEquippedAndArmors(player, systems, col1X, 60);
    this._renderAttributes(player, systems, col2X, 60);
    this._renderInventoryLists(player, systems, col3X, 60);
  }

  _renderEquippedAndArmors(player, systems, x, y) {
    const s = this.scene;
    const armor = systems.armor;
    const weapon = systems.weapon;
    const xp = systems.xp;

    const label = s.add.text(x, y, 'EQUIPAMENTO ATIVO', {
      fontFamily: 'Cinzel', fontSize: '13px', color: '#ffaa44',
    }).setScrollFactor(0).setDepth(301);
    this._elements.push(label);

    // Arma equipada
    const w = weapon.equipped;
    let curY = y + 24;

    if (w) {
      const rColor = RARITY_COLORS[weapon.effectiveRarity] ?? '#fff';
      const wText = s.add.text(x, curY, `⚔ ${w.name} +${w.upgradeLevel ?? 0} [Req: Nv.${w.requiredLevel ?? 1}]`, {
        fontFamily: 'Inter', fontSize: '11px', color: rColor,
      }).setScrollFactor(0).setDepth(301);
      this._elements.push(wText);

      // Botão de upgrade de arma
      const upgCost = XPSystem.weaponUpgradeCost(w.upgradeLevel ?? 0);
      const canUpg  = xp.stored >= upgCost && (w.upgradeLevel ?? 0) < 20;
      const upgBtn = s.add.text(x + 230, curY,
        canUpg ? `[+1: ${this._fmt(upgCost)} XP]` : `[${this._fmt(upgCost)} XP]`,
        { fontFamily: 'Inter', fontSize: '10px', color: canUpg ? '#44ff88' : '#666666' }
      ).setScrollFactor(0).setDepth(302);

      if (canUpg) {
        upgBtn.setInteractive().on('pointerup', () => {
          const result = UpgradeSystem.upgrade(w, xp, true);
          if (result.success) {
            this.scene.events.emit('weapon:upgraded', { result });
            this._render(player, systems);
          }
        });
      }
      this._elements.push(upgBtn);
      curY += 20;
    }

    // Penalidade de Nível
    const reqLevel = w?.requiredLevel ?? 1;
    const playerLevel = systems.level.level;
    const hasPenalty = playerLevel < reqLevel;

    if (hasPenalty) {
      const penNotice = s.add.text(x, curY,
        `⚠ PENALIDADE (Nv.${playerLevel} < Nv.${reqLevel}): 2 armaduras desativadas!`, {
        fontFamily: 'Inter', fontSize: '10px', color: '#ff4444', fontStyle: 'bold',
      }).setScrollFactor(0).setDepth(301);
      this._elements.push(penNotice);
      curY += 18;
    }

    // 4 Slots de Armadura
    const slots = ['helmet', 'chest', 'gloves', 'legs'];
    const slotNames = { helmet: 'Elmo', chest: 'Tronco', gloves: 'Manoplas', legs: 'Calça' };

    slots.forEach((slot) => {
      const piece = armor.slots[slot];
      const disabled = armor.disabledSlots.has(slot);

      if (piece) {
        const rColor = RARITY_COLORS[piece.rarity] ?? '#aaa';
        const txt = s.add.text(x, curY,
          `${slotNames[slot]}: ${piece.name} +${piece.upgradeLevel ?? 0}${disabled ? ' [DESATIVADO]' : ''}`,
          { fontFamily: 'Inter', fontSize: '10px', color: disabled ? '#666666' : rColor }
        ).setScrollFactor(0).setDepth(301);
        this._elements.push(txt);

        // Botão para alternar desativação em penalidade
        if (hasPenalty) {
          const toggleBtn = s.add.text(x + 225, curY, disabled ? '[Ativar]' : '[Desativar]', {
            fontFamily: 'Inter', fontSize: '9px', color: disabled ? '#ffaa44' : '#888888',
          }).setScrollFactor(0).setDepth(302).setInteractive();

          toggleBtn.on('pointerup', () => {
            if (disabled) {
              armor.disabledSlots.delete(slot);
            } else {
              if (armor.disabledSlots.size >= 2) {
                // Remove o mais antigo para manter exatamente 2 desativados
                const first = armor.disabledSlots.values().next().value;
                armor.disabledSlots.delete(first);
              }
              armor.disabledSlots.add(slot);
            }
            player.refreshStatsFromAttributes();
            this._render(player, systems);
          });
          this._elements.push(toggleBtn);
        }

        // Botão de upgrade de armadura com XP
        const upgCost = XPSystem.armorUpgradeCost(piece.upgradeLevel ?? 0);
        const canUpg = xp.stored >= upgCost && (piece.upgradeLevel ?? 0) < 20;
        const upgArmorBtn = s.add.text(x + 290, curY,
          canUpg ? `[+1: ${this._fmt(upgCost)}]` : `[${this._fmt(upgCost)}]`,
          { fontFamily: 'Inter', fontSize: '9px', color: canUpg ? '#44ff88' : '#555555' }
        ).setScrollFactor(0).setDepth(302);

        if (canUpg) {
          upgArmorBtn.setInteractive().on('pointerup', () => {
            const result = UpgradeSystem.upgrade(piece, xp, false);
            if (result.success) {
              player.refreshStatsFromAttributes();
              this._render(player, systems);
            }
          });
        }
        this._elements.push(upgArmorBtn);

        curY += 15;
        // Stats da peça
        const statStr = Object.entries(piece.stats ?? {})
          .map(([k, v]) => `${k}: ${typeof v === 'number' && v < 1 ? (v * 100).toFixed(1) + '%' : Math.floor(v)}`)
          .join(' | ');
        const statTxt = s.add.text(x + 8, curY, statStr, {
          fontFamily: 'Inter', fontSize: '9px', color: disabled ? '#444444' : '#888888',
        }).setScrollFactor(0).setDepth(301);
        this._elements.push(statTxt);
        curY += 18;
      } else {
        const empty = s.add.text(x, curY, `${slotNames[slot]}: vazio`, {
          fontFamily: 'Inter', fontSize: '10px', color: '#444444',
        }).setScrollFactor(0).setDepth(301);
        this._elements.push(empty);
        curY += 22;
      }
    });
  }

  _renderAttributes(player, systems, x, y) {
    const s = this.scene;
    const stat = systems.stat;
    const lvl  = systems.level;
    const xp   = systems.xp;

    const label = s.add.text(x, y, 'ATRIBUTOS & LEVEL UP', {
      fontFamily: 'Cinzel', fontSize: '13px', color: '#ffaa44',
    }).setScrollFactor(0).setDepth(301);
    this._elements.push(label);

    const pts = s.add.text(x, y + 22, `Pontos livres: ${stat.freePoints}`, {
      fontFamily: 'Inter', fontSize: '11px', color: stat.freePoints > 0 ? '#44ff88' : '#888888',
    }).setScrollFactor(0).setDepth(301);
    this._elements.push(pts);

    const attrs = [
      { key: 'vigor',     name: 'Vigor',       value: stat.vigor,     desc: `HP: ${stat.maxHP}` },
      { key: 'strength',  name: 'Força',       value: stat.strength,  desc: `Atk STR: +${Math.round(stat.strengthBonus)}` },
      { key: 'dexterity', name: 'Destreza',    value: stat.dexterity, desc: `Atk DEX: +${Math.round(stat.dexterityBonus)}` },
      { key: 'endurance', name: 'Resistência', value: stat.endurance, desc: `Sta: ${stat.maxStamina}` },
      { key: 'arcane',    name: 'Arcano',      value: stat.arcane,    desc: `Elem: +${Math.round(stat.arcaneBonus)}` },
    ];

    attrs.forEach((attr, i) => {
      const ay = y + 46 + i * 26;
      const attrText = s.add.text(x, ay, `${attr.name}: ${attr.value}  (${attr.desc})`, {
        fontFamily: 'Inter', fontSize: '11px', color: '#cccccc',
      }).setScrollFactor(0).setDepth(301);
      this._elements.push(attrText);

      if (stat.freePoints > 0) {
        const plusBtn = s.add.text(x + 190, ay, '[+]', {
          fontFamily: 'Inter', fontSize: '11px', color: '#44ff88',
        }).setScrollFactor(0).setDepth(302).setInteractive();

        plusBtn.on('pointerup', () => {
          if (stat.allocate(attr.key)) {
            player.refreshStatsFromAttributes();
            this.scene.events.emit('stats:updated');
            this._render(player, systems);
          }
        });
        this._elements.push(plusBtn);
      }
    });

    // Botão de Level Up manual
    const canLvl = lvl.canLevelUp();
    const xpNeeded = lvl.xpForNextLevel;
    const lvlBtn = s.add.text(x, y + 46 + attrs.length * 26 + 10,
      canLvl
        ? `▶ SUBIR NV. ${lvl.level} → ${lvl.level + 1} (${this._fmt(xpNeeded)} XP)`
        : `XP para nv. ${lvl.level + 1}: ${this._fmt(xpNeeded)}`,
      { fontFamily: 'Cinzel', fontSize: '11px', color: canLvl ? '#ffdd00' : '#555555' }
    ).setScrollFactor(0).setDepth(301);

    if (canLvl) {
      lvlBtn.setInteractive().on('pointerup', () => {
        lvl.levelUp();
        player.refreshStatsFromAttributes();
        player.checkWeaponLevelPenalty();
        this.scene.events.emit('player:levelup', { level: lvl.level });
        this._render(player, systems);
      });
    }
    this._elements.push(lvlBtn);
  }

  _renderInventoryLists(player, systems, x, y) {
    const s = this.scene;
    const inv = systems.inventory;

    // Armas guardadas
    const wLabel = s.add.text(x, y, 'ARMAS DISPONÍVEIS', {
      fontFamily: 'Cinzel', fontSize: '12px', color: '#ffaa44',
    }).setScrollFactor(0).setDepth(301);
    this._elements.push(wLabel);

    const weapons = inv.getAll('weapons');
    let curY = y + 20;

    if (weapons.length === 0) {
      const empty = s.add.text(x, curY, 'Nenhuma arma guardada.', {
        fontFamily: 'Inter', fontSize: '10px', color: '#555555',
      }).setScrollFactor(0).setDepth(301);
      this._elements.push(empty);
      curY += 18;
    } else {
      weapons.slice(0, 5).forEach((w) => {
        const rColor = RARITY_COLORS[w.rarity] ?? '#fff';
        const wText = s.add.text(x, curY, `${w.name} +${w.upgradeLevel ?? 0}`, {
          fontFamily: 'Inter', fontSize: '10px', color: rColor,
        }).setScrollFactor(0).setDepth(301);

        const equipBtn = s.add.text(x + 160, curY, '[Equipar]', {
          fontFamily: 'Inter', fontSize: '10px', color: '#44aaff',
        }).setScrollFactor(0).setDepth(302).setInteractive();

        equipBtn.on('pointerup', () => {
          systems.weapon.equip(w);
          player.checkWeaponLevelPenalty();
          this.scene.events.emit('weapon:equipped', { weapon: w });
          this._render(player, systems);
        });

        this._elements.push(wText, equipBtn);
        curY += 16;
      });
    }

    curY += 10;
    // Armaduras guardadas
    const aLabel = s.add.text(x, curY, 'ARMADURAS GUARDADAS', {
      fontFamily: 'Cinzel', fontSize: '12px', color: '#ffaa44',
    }).setScrollFactor(0).setDepth(301);
    this._elements.push(aLabel);
    curY += 20;

    const armors = inv.getAll('armors');
    if (armors.length === 0) {
      const empty = s.add.text(x, curY, 'Nenhuma armadura guardada.', {
        fontFamily: 'Inter', fontSize: '10px', color: '#555555',
      }).setScrollFactor(0).setDepth(301);
      this._elements.push(empty);
      curY += 18;
    } else {
      armors.slice(0, 4).forEach((piece) => {
        const rColor = RARITY_COLORS[piece.rarity] ?? '#aaa';
        const pText = s.add.text(x, curY, `${piece.name} (${piece.slot})`, {
          fontFamily: 'Inter', fontSize: '10px', color: rColor,
        }).setScrollFactor(0).setDepth(301);

        const equipArmorBtn = s.add.text(x + 160, curY, '[Equipar]', {
          fontFamily: 'Inter', fontSize: '10px', color: '#44ffaa',
        }).setScrollFactor(0).setDepth(302).setInteractive();

        equipArmorBtn.on('pointerup', () => {
          const oldPiece = systems.armor.slots[piece.slot];
          systems.armor.equip(piece);
          inv.remove(piece.instanceId, 'armors');
          if (oldPiece) inv.add(oldPiece, 'armors');
          player.refreshStatsFromAttributes();
          this._render(player, systems);
        });

        this._elements.push(pText, equipArmorBtn);
        curY += 16;
      });
    }

    curY += 10;
    // Relíquias
    const rLabel = s.add.text(x, curY, 'RELÍQUIAS (PASSIVAS)', {
      fontFamily: 'Cinzel', fontSize: '12px', color: '#ffaa44',
    }).setScrollFactor(0).setDepth(301);
    this._elements.push(rLabel);
    curY += 20;

    const equippedRelics = player.relics ?? [];
    const obtainedRelics = inv.getAll('relics');

    // Mapeia todas as relíquias conhecidas (obtidas ou equipadas)
    const allRelicKeys = Array.from(new Set([
      ...equippedRelics,
      ...obtainedRelics.map(r => r.id ?? r.itemId),
    ]));

    if (allRelicKeys.length === 0) {
      const empty = s.add.text(x, curY, 'Nenhuma relíquia encontrada.', {
        fontFamily: 'Inter', fontSize: '10px', color: '#555555',
      }).setScrollFactor(0).setDepth(301);
      this._elements.push(empty);
    } else {
      allRelicKeys.forEach(key => {
        const itemInfo = ITEMS[key];
        const rName = itemInfo ? itemInfo.name : key;
        const isEquipped = equippedRelics.includes(key);

        const rTxt = s.add.text(x, curY, `✦ ${rName}`, {
          fontFamily: 'Inter', fontSize: '10px', color: isEquipped ? '#aa44ff' : '#888888',
        }).setScrollFactor(0).setDepth(301);

        const toggleBtn = s.add.text(x + 160, curY, isEquipped ? '[Desequipar]' : '[Equipar]', {
          fontFamily: 'Inter', fontSize: '10px', color: isEquipped ? '#ff8888' : '#44ffaa',
        }).setScrollFactor(0).setDepth(302).setInteractive();

        toggleBtn.on('pointerup', () => {
          if (isEquipped) {
            player.relics = player.relics.filter(r => r !== key);
          } else {
            if (!player.relics.includes(key)) player.relics.push(key);
          }
          if (systems.scene) {
            systems.scene.equippedRelics = [...player.relics];
          }
          this._render(player, systems);
        });

        this._elements.push(rTxt, toggleBtn);
        curY += 16;
      });
    }
  }

  _fmt(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
    return Math.floor(n).toString();
  }
}

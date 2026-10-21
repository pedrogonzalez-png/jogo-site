import test from 'node:test';
import assert from 'node:assert/strict';

import { BALANCE } from '../src/data/balance.js';
import { DamageSystem } from '../src/combat/DamageSystem.js';
import { StatSystem } from '../src/progression/StatSystem.js';
import { StaminaSystem } from '../src/combat/StaminaSystem.js';
import { StatusEffectSystem } from '../src/combat/StatusEffectSystem.js';
import { ParrySystem } from '../src/combat/ParrySystem.js';
import { WeaponSystem } from '../src/equipment/WeaponSystem.js';
import { InventorySystem } from '../src/equipment/InventorySystem.js';
import { LootSystem } from '../src/equipment/LootSystem.js';
import { AbyssChallengeSystem } from '../src/progression/AbyssChallengeSystem.js';
import { XPSystem } from '../src/progression/XPSystem.js';
import { WEAPONS } from '../src/data/weapons.js';

test('dano físico: zero, defesa >= 2.5x e crítico antes da defesa', () => {
  assert.equal(DamageSystem.calculate(0, 0), 0);
  assert.equal(DamageSystem.calculate(0, 100), 0);
  assert.equal(DamageSystem.calculate(10, 25), 0);
  assert.equal(DamageSystem.calculate(20, 0), 20);
  assert.equal(DamageSystem.calculate(Number.NaN, 0), 0);
  assert.equal(DamageSystem.calculate(10, Infinity), 0);
  assert.equal(DamageSystem.calculate(10, 10, true, 2), 16);
  assert.equal(DamageSystem.applyElementalResistance(30, 1), 0);
  assert.equal(DamageSystem.applyElementalResistance(30, -1), 60);
  assert.equal(DamageSystem.applyElementalResistance(30, Infinity), 30);
});

test('atributos não podem criar pontos via valores negativos ou atributos desconhecidos', () => {
  const stats = new StatSystem();
  const points = stats.freePoints;
  assert.equal(stats.allocate('vigor', -1), false);
  assert.equal(stats.allocate('vigor', 0), false);
  assert.equal(stats.allocate('vigor', 1.5), false);
  assert.equal(stats.allocate('__proto__', 1), false);
  assert.equal(stats.allocate('freePoints', 1), false);
  assert.equal(stats.allocate('strength', points + 1), false);
  assert.equal(stats.freePoints, points);
  assert.equal(stats.allocate('vigor', 2), true);
  assert.equal(stats.vigor, 12);
  assert.equal(stats.freePoints, points - 2);
  assert.equal(stats.addFreePoints(-10), false);
  assert.equal(stats.freePoints, points - 2);
});

test('stamina nunca aumenta com gasto negativo', () => {
  const stamina = new StaminaSystem(100);
  assert.equal(stamina.spend(-50), false);
  assert.equal(stamina.current, 100);
  stamina.forceSpend(-70);
  assert.equal(stamina.current, 100);
  stamina.restore(-10);
  assert.equal(stamina.current, 100);
  assert.equal(stamina.spend(25), true);
  assert.equal(stamina.current, 75);
  stamina.restore(10);
  assert.equal(stamina.current, 85);
});

test('parry só funciona durante a janela de 200 ms', () => {
  const parry = new ParrySystem();
  assert.equal(BALANCE.PLAYER.PARRY_WINDOW, 200);
  parry.trigger();
  parry.update(199);
  assert.equal(parry.isActive, true);
  assert.equal(parry.tryParry(true)?.success, true);
  assert.equal(parry.isActive, false);
  parry.trigger();
  parry.update(201);
  assert.equal(parry.tryParry(true), null);
});

test('status de dano por tempo conserva ticks mesmo com delta grande, sem ticks pós-expiração', () => {
  const s = new StatusEffectSystem();
  assert.equal(s.addBuildup('POISON', 90)?.activated, true);
  assert.equal(s.hasActive('POISON'), true);
  assert.equal(s.update(3500).length, 3);
  assert.equal(s.update(6600).length, 7);
  assert.equal(s.hasActive('POISON'), false);
  assert.deepEqual(s.update(1000), []);
  assert.equal(s.addBuildup('FIRE', -40), null);
  assert.equal(s.getBuildups().FIRE ?? 0, 0);
});

test('recompensas +50/+100/+150/+200 usam apenas maior tier', () => {
  const sys = new AbyssChallengeSystem();
  const cases = [
    [49, null, 0], [50, 1, 5], [99, 1, 5],
    [100, 2, 10], [149, 2, 10], [150, 3, 20],
    [199, 3, 20], [200, 4, 30], [400, 4, 30],
  ];
  for (const [difference, tier, points] of cases) {
    const record = sys.recordCombatStart(10, 10 + difference);
    const result = sys.calculateReward(record);
    assert.equal(result?.tier ?? null, tier);
    assert.equal(result?.bonusPoints ?? 0, points);
    assert.equal(record.diff, difference);
  }
});

test('loot aleatório nunca promove itens comuns para Único', () => {
  const loot = new LootSystem({ next: () => 0 });
  const rarity = loot._calculateRarity({
    baseRarity: 'COMMON', enemyLevel: 99999,
    isElite: true, isBoss: true, isAnomaly: true, abyssDepth: 9999,
  });
  assert.equal(rarity, 'LEGENDARY');
  assert.equal(loot._calculateRarity({
    baseRarity: 'UNIQUE', enemyLevel: 1,
    isElite: false, isBoss: true, isAnomaly: false, abyssDepth: 0,
  }), 'UNIQUE');
});

test('inventário impede duplicatas de itens únicos, inclusive após save e load', () => {
  const inventory = new InventorySystem();
  const unique = { ...WEAPONS.abyss_executioner };
  assert.equal(inventory.add(unique, 'weapons'), true);
  assert.equal(inventory.add(unique, 'weapons'), false);
  const saved = inventory.serialize();
  assert.deepEqual(saved.uniqueItemIds, [unique.id]);

  const resumed = new InventorySystem();
  resumed.deserialize(saved);
  assert.equal(resumed.add(unique, 'weapons'), false);
  resumed.remove(resumed.getAll('weapons')[0].instanceId, 'weapons');
  assert.equal(resumed.add(unique, 'weapons'), false);

  // Em saves antigos sem campo de histórico, reconstruir da posse atual.
  const old = new InventorySystem();
  old.deserialize({ items: { weapons: [{ ...unique, instanceId: 'old-instance' }] } });
  assert.equal(old.add(unique, 'weapons'), false);
});

test('a raridade de uma arma Única não desaparece durante upgrades', () => {
  const weapon = new WeaponSystem();
  weapon.equip(WEAPONS.abyss_executioner);
  assert.equal(weapon.effectiveRarity, 'UNIQUE');
  weapon.equipped.upgradeLevel = 20;
  assert.equal(weapon.effectiveRarity, 'UNIQUE');
});

test('segunda morte elimina a antiga orbe e armazena a XP nova', () => {
  const xp = new XPSystem();
  xp.addXP(120);
  xp.onDeath({ x: 12, y: 18 }, 1, 0);
  assert.equal(xp.hasLostXP, true);
  assert.equal(xp.lost, 120);
  xp.addXP(25);
  xp.onDeath({ x: 20, y: 30 }, 2, 0);
  assert.equal(xp.lost, 25);
  assert.equal(xp.recoverLost(), 25);
  assert.equal(xp.stored, 25);
  assert.equal(xp.hasLostXP, false);
});

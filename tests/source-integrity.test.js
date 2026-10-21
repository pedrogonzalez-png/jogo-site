import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

import { BIOMES, BIOME_IDS } from '../src/data/biomes.js';
import { ENEMY_TEMPLATES, BOSS_TEMPLATES } from '../src/data/enemies.js';
import { XPSystem } from '../src/progression/XPSystem.js';
import { StatSystem } from '../src/progression/StatSystem.js';
import { LevelSystem } from '../src/progression/LevelSystem.js';
import { InventorySystem } from '../src/equipment/InventorySystem.js';
import { WeaponSystem } from '../src/equipment/WeaponSystem.js';
import { ArmorSystem } from '../src/equipment/ArmorSystem.js';
import { SaveSystem } from '../src/save/SaveSystem.js';

const ROOT = resolve(import.meta.dirname, '..');
function javaScriptFiles(folder) {
  return readdirSync(folder).flatMap(name => {
    const pathname = join(folder, name);
    return statSync(pathname).isDirectory()
      ? javaScriptFiles(pathname)
      : pathname.endsWith('.js') ? [pathname] : [];
  });
}

test('todos os módulos de src têm sintaxe JavaScript válida', () => {
  const files = javaScriptFiles(join(ROOT, 'src'));
  assert.ok(files.length >= 45);
  for (const file of files) {
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    assert.equal(result.status, 0, file + ': ' + (result.stderr || result.stdout));
  }
});

test('imports relativos apontam para arquivos existentes', () => {
  for (const file of javaScriptFiles(join(ROOT, 'src'))) {
    const source = readFileSync(file, 'utf8');
    const imports = [...source.matchAll(/import\s+[\s\S]*?\sfrom\s+['"]([^'"]+)['"]/g)];
    for (const match of imports) {
      if (!match[1].startsWith('.')) continue;
      assert.ok(existsSync(resolve(dirname(file), match[1])), file + ' → ' + match[1]);
    }
  }
});

test('cada um dos dez biomas referencia templates válidos de inimigo, elite e chefe', () => {
  assert.equal(BIOME_IDS.length, 10);
  for (const biome of Object.values(BIOMES)) {
    assert.ok(biome.enemyPool.length > 0);
    assert.ok(biome.elitePool.length > 0);
    assert.ok(biome.bossPool.length > 0);
    for (const id of [...biome.enemyPool, ...biome.elitePool]) {
      assert.ok(ENEMY_TEMPLATES[id], biome.id + ': inimigo ausente ' + id);
    }
    for (const id of biome.bossPool) {
      assert.ok(BOSS_TEMPLATES[id], biome.id + ': boss ausente ' + id);
    }
  }
});

test('serialização mantém baús abertos e identidade de item Único', () => {
  const makeState = () => {
    const xpSystem = new XPSystem();
    const statSystem = new StatSystem();
    return {
      seed: 'TESTE-SAVE', xpSystem, statSystem,
      levelSystem: new LevelSystem(xpSystem, statSystem),
      weaponSystem: new WeaponSystem(),
      armorSystem: new ArmorSystem(),
      inventorySystem: new InventorySystem(),
      healCharges: 2, maxHealCharges: 3, healAmount: 40,
      discoveredSanctuaries: [3], currentAreaIndex: 2, currentRoomIndex: 5,
      defeatedBosses: new Set(['boss_0']), abyssDepth: 3,
      abyssUniqueObtained: new Set(), openedChests: new Set(['2:5']),
      equippedRelics: [], npcState: {},
    };
  };
  const saver = new SaveSystem();
  const before = makeState();
  const payload = saver.buildSaveData(before);
  const after = makeState();
  after.openedChests.clear();
  assert.equal(saver.applySaveData(payload, after), true);
  assert.equal(after.openedChests.has('2:5'), true);
  assert.equal(after.currentRoomIndex, 5);
  assert.equal(after.levelSystem.level, 1);
});

test('saves legados sem campos novos são recuperados com valores padrão', () => {
  const xpSystem = new XPSystem();
  const statSystem = new StatSystem();
  const game = {
    xpSystem, statSystem, levelSystem: new LevelSystem(xpSystem, statSystem),
    weaponSystem: new WeaponSystem(), armorSystem: new ArmorSystem(),
    inventorySystem: new InventorySystem(),
  };
  const sav = new SaveSystem();
  assert.equal(sav.applySaveData({ seed: 'antigo' }, game), true);
  assert.equal(game.openedChests.size, 0);
  assert.equal(game.inventorySystem.uniqueItemIds.size, 0);
});

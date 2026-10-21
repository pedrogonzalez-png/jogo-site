import test from 'node:test';
import assert from 'node:assert/strict';

import { KNIGHT_FRAMES } from '../src/ascii/KnightArt.js';
import { BOSS_ART } from '../src/ascii/BossArt.js';
import { ENEMY_ART } from '../src/ascii/EnemyArt.js';
import { ENVIRONMENT_ART } from '../src/ascii/EnvironmentArt.js';
import { LIQUIDS_AND_VFX } from '../src/ascii/LiquidsAndVFXArt.js';
import { BIOMES } from '../src/data/biomes.js';

test('os dez chefes declarados possuem arte ASCII correspondente', () => {
  const bossIds = Object.values(BIOMES).flatMap(b => b.bossPool);
  assert.equal(new Set(bossIds).size, 10);
  for (const id of bossIds) {
    const art = BOSS_ART[id];
    assert.ok(art, 'Boss sem ilustração ASCII: ' + id);
    assert.ok(Array.isArray(art.lines) && art.lines.length >= 8, id + ' sem linhas suficientes');
    assert.equal(typeof art.colorResolver, 'function', id + ' sem paleta');
  }
});

test('cavaleiro tem dados ASCII para idle, caminhada, ataque e bloqueio', () => {
  for (const frame of ['idle_0', 'idle_1', 'walk_0', 'walk_1', 'attack_0', 'block']) {
    const art = KNIGHT_FRAMES[frame];
    assert.ok(art, 'Quadro do cavaleiro ausente: ' + frame);
    assert.ok(Array.isArray(art.lines) && art.lines.length > 0, frame);
    assert.equal(typeof art.colorResolver, 'function', frame);
  }
  // Contrato de grade para as poses de referência; consistência VISUAL exige
  // verificação humana, mesmo com a mesma altura/largura declaradas.
  for (const frame of ['idle_0', 'idle_1', 'walk_0', 'walk_1']) {
    assert.equal(KNIGHT_FRAMES[frame].width, 200);
    assert.equal(KNIGHT_FRAMES[frame].height, 100);
    assert.equal(KNIGHT_FRAMES[frame].lines.length, 100);
  }
});

test('os arquétipos base e líquidos possuem quadros ASCII acessíveis', () => {
  for (const id of ['skeleton','beast','guardian','mage','drowned','aberration']) {
    assert.ok(ENEMY_ART[id]?.lines?.length > 0, 'Inimigo sem arte: ' + id);
  }
  for (const part of ['walls', 'floors', 'doors']) {
    assert.ok(ENVIRONMENT_ART[part], 'Material de ambiente ausente: ' + part);
  }
  for (const frame of ['frame_0','frame_1','frame_2','frame_3']) {
    assert.ok(Array.isArray(LIQUIDS_AND_VFX.water[frame]), 'Água sem quadro ' + frame);
  }
  assert.ok(LIQUIDS_AND_VFX.blood.frame_0.length > 0);
  assert.ok(LIQUIDS_AND_VFX.magma.frame_0.length > 0);
});

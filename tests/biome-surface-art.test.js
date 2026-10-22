import test from 'node:test';
import assert from 'node:assert/strict';

import { BIOME_IDS } from '../src/data/biomes.js';
import { BIOME_ASCII_PALETTES } from '../src/ascii/AsciiPalette.js';
import { BIOME_SURFACE_ART, getBiomeSurface } from '../src/ascii/BiomeSurfaceArt.js';

test('todos os dez biomas possuem pisos e paredes ASCII de 8x8 caracteres', () => {
  assert.equal(BIOME_IDS.length, 10);
  assert.deepEqual(Object.keys(BIOME_SURFACE_ART).sort(), [...BIOME_IDS].sort());

  for (const biome of BIOME_IDS) {
    assert.ok(BIOME_ASCII_PALETTES[biome], `Paleta ausente: ${biome}`);
    for (const material of ['floor', 'wall']) {
      const base = getBiomeSurface(biome, material);
      assert.equal(base.length, 8, `${biome} ${material}`);
      for (const row of base) {
        assert.equal([...row].length, 8, `${biome} ${material} / ${row}`);
        assert.match(row, /^[~ .:@%#*+=\\-]+$/);
      }
    }
  }
});

test('biomas diferentes possuem composições arquitetônicas distintas, não apenas tint', () => {
  const floors = BIOME_IDS.map(id => getBiomeSurface(id, 'floor').join('\n'));
  const walls = BIOME_IDS.map(id => getBiomeSurface(id, 'wall').join('\n'));
  assert.equal(new Set(floors).size, 10, 'Pisos idênticos entre biomas');
  assert.equal(new Set(walls).size, 10, 'Paredes idênticas entre biomas');
});

test('variantes de rachadura e detritos preservam dimensões e são determinísticas', () => {
  for (const biome of BIOME_IDS) {
    for (const material of ['floor', 'wall']) {
      const base = getBiomeSurface(biome, material);
      const variant = material === 'floor' ? 'debris' : 'cracked';
      const first = getBiomeSurface(biome, material, variant);
      assert.notDeepEqual(first, base, `${biome} ${material} sem variação real`);
      assert.deepEqual(first, getBiomeSurface(biome, material, variant),
        `Variação de ${biome} usa aleatoriedade indevida`);
      assert.ok(first.every(row => row.length === 8));
    }
  }
});

test('chaves desconhecidas não renderizam art de outro bioma por acidente', () => {
  assert.equal(getBiomeSurface('INEXISTENTE', 'floor'), null);
  assert.equal(getBiomeSurface('ARREDORES_CINZENTOS', 'portal'), null);
  assert.equal(getBiomeSurface('ARREDORES_CINZENTOS', 'wall', 'unknown'), null);
});

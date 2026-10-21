import test from 'node:test';
import assert from 'node:assert/strict';

import { BIOME_IDS } from '../src/data/biomes.js';
import { SeedSystem } from '../src/world/SeedSystem.js';
import { WorldGenerator } from '../src/world/WorldGenerator.js';

const DIRECTIONS = { N: 'S', S: 'N', E: 'W', W: 'E' };

test('mesma seed produz mesmas salas, biomas, portas e tiles', () => {
  for (const seed of ['ABISMO-TESTE-1', 'ABISMO-TESTE-2', '20261021']) {
    const a = new WorldGenerator(new SeedSystem(seed)).generateArea(0);
    const b = new WorldGenerator(new SeedSystem(seed)).generateArea(0);
    assert.equal(a.biomeId, b.biomeId);
    assert.equal(a.rooms.length, b.rooms.length);
    for (let i = 0; i < a.rooms.length; i++) {
      assert.equal(a.rooms[i].type, b.rooms[i].type);
      assert.deepEqual([...a.rooms[i].data.exits].sort(),
        [...b.rooms[i].data.exits].sort());
      assert.deepEqual(a.rooms[i].data.grid.map(row => [...row]),
        b.rooms[i].data.grid.map(row => [...row]));
    }
  }
});

test('dez biomas geram um grafo válido, bidirecional e com salas críticas', () => {
  const expected = new Set(['ENTRANCE', 'SANCTUARY', 'ELITE', 'BOSS']);
  for (const biomeId of BIOME_IDS) {
    for (const seed of ['A', 'B', 'C']) {
      const area = new WorldGenerator(new SeedSystem(seed), biomeId).generateArea(0);
      assert.equal(area.biome.id, biomeId);
      const types = new Set(area.rooms.map(r => r.type));
      for (const type of expected) assert.equal(types.has(type), true, biomeId + ':' + type);
      for (const room of area.rooms) {
        const conn = area.connections.get(room.id);
        assert.ok(conn);
        for (const [direction, other] of Object.entries(conn)) {
          if (other === null) continue;
          assert.ok(room.data.exits.has(direction));
          assert.equal(area.connections.get(other)[DIRECTIONS[direction]], room.id);
        }
      }
      assert.ok(area.rooms.length >= 8);
    }
  }
});

test('índice de área não deve produzir bioma ausente', () => {
  const area = new WorldGenerator(new SeedSystem('fallback-test')).generateArea(BIOME_IDS.length * 2);
  assert.ok(area.biome);
  assert.ok(BIOME_IDS.includes(area.biomeId));
});

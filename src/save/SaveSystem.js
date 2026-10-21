// ============================================================
// save/SaveSystem.js
// Persistência via IndexedDB. API Promise-based.
// ============================================================

const DB_NAME   = 'AbismoGame';
const DB_VERSION = 1;
const STORE_NAME = 'saves';

export class SaveSystem {
  constructor() {
    this._db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'slot' });
        }
      };

      req.onsuccess = (e) => { this._db = e.target.result; resolve(); };
      req.onerror   = (e) => reject(e.target.error);
    });
  }

  async save(slot, data) {
    return new Promise((resolve, reject) => {
      const tx   = this._db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ slot, timestamp: Date.now(), data });
      tx.oncomplete = resolve;
      tx.onerror    = (e) => reject(e.target.error);
    });
  }

  async load(slot) {
    return new Promise((resolve, reject) => {
      const tx    = this._db.transaction(STORE_NAME, 'readonly');
      const store  = tx.objectStore(STORE_NAME);
      const req    = store.get(slot);
      req.onsuccess = (e) => resolve(e.target.result?.data ?? null);
      req.onerror   = (e) => reject(e.target.error);
    });
  }

  async listSlots() {
    return new Promise((resolve, reject) => {
      const tx    = this._db.transaction(STORE_NAME, 'readonly');
      const store  = tx.objectStore(STORE_NAME);
      const req    = store.getAll();
      req.onsuccess = (e) => resolve(e.target.result.map(r => ({
        slot: r.slot, timestamp: r.timestamp,
        level: r.data?.level ?? 1,
        seed:  r.data?.seed  ?? '???',
      })));
      req.onerror   = (e) => reject(e.target.error);
    });
  }

  async delete(slot) {
    return new Promise((resolve, reject) => {
      const tx    = this._db.transaction(STORE_NAME, 'readwrite');
      const store  = tx.objectStore(STORE_NAME);
      store.delete(slot);
      tx.oncomplete = resolve;
      tx.onerror    = (e) => reject(e.target.error);
    });
  }

  /**
   * Serializa o estado completo do jogo em um objeto salvo.
   */
  buildSaveData(game) {
    return {
      seed:         game.seed,
      level:        game.levelSystem.level,
      xp:           game.xpSystem.serialize(),
      stats:        game.statSystem.serialize(),
      weapon:       game.weaponSystem.serialize(),
      armor:        game.armorSystem.serialize(),
      inventory:    game.inventorySystem.serialize(),
      healCharges:  game.healCharges,
      maxHealCharges: game.maxHealCharges,
      healAmount:   game.healAmount,
      sanctuaries:  game.discoveredSanctuaries,
      currentArea:  game.currentAreaIndex,
      currentRoom:  game.currentRoomIndex,
      defeatedBosses: [...(game.defeatedBosses ?? [])],
      abyssDepth:   game.abyssDepth ?? 0,
      abyssUniques: [...(game.abyssUniqueObtained ?? [])],
      openedChests: [...(game.openedChests ?? [])],
      relics: {
        equipped: [...(game.equippedRelics ?? game.player?.relics ?? [])],
      },
      npcs:         game.npcState ?? {},
      version:      '1.0.0',
    };
  }

  /**
   * Aplica um save ao estado do jogo.
   */
  applySaveData(data, game) {
    if (!data) return false;

    game.seed = data.seed;
    game.xpSystem.deserialize(data.xp);
    game.levelSystem.level = data.level ?? 1;
    // Saves antigos podem não conter todas as chaves: usar defaults seguros.
    game.statSystem.deserialize(data.stats ?? {});
    game.weaponSystem.deserialize(data.weapon ?? {});
    game.armorSystem.deserialize(data.armor ?? {});
    game.inventorySystem.deserialize(data.inventory ?? {});
    // Recuperar histórico de Únicos de saves antigos que só guardavam
    // o item equipado, mesmo quando ele não está na lista do inventário.
    for (const item of [game.weaponSystem.equipped, ...Object.values(game.armorSystem.slots)]) {
      if (item?.rarity === 'UNIQUE' && typeof item.id === 'string') {
        game.inventorySystem.uniqueItemIds.add(item.id);
      }
    }
    game.healCharges    = data.healCharges    ?? 3;
    game.maxHealCharges = data.maxHealCharges ?? 3;
    game.healAmount     = data.healAmount     ?? 40;
    game.discoveredSanctuaries = data.sanctuaries ?? [];
    game.currentAreaIndex = data.currentArea ?? 0;
    game.currentRoomIndex = data.currentRoom ?? 0;
    game.defeatedBosses   = new Set(data.defeatedBosses ?? []);
    game.abyssDepth        = data.abyssDepth ?? 0;
    game.abyssUniqueObtained = new Set(data.abyssUniques ?? []);
    game.openedChests = new Set(data.openedChests ?? []);
    game.equippedRelics    = Array.isArray(data.relics?.equipped)
      ? [...data.relics.equipped]
      : (Array.isArray(data.equippedRelics) ? [...data.equippedRelics] : []);
    if (game.player) {
      game.player.relics = [...game.equippedRelics];
    }
    game.npcState         = data.npcs ?? {};

    return true;
  }
}

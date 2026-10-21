// ============================================================
// equipment/InventorySystem.js
// Gerencia o inventário por categoria.
// ============================================================

const CATEGORIES = ['weapons', 'armors', 'relics', 'consumables', 'materials', 'lore'];

export class InventorySystem {
  constructor() {
    this.items = {
      weapons:     [],
      armors:      [],
      relics:      [],
      consumables: [],
      materials:   [],
      lore:        [],
    };
    // Histórico permanente de IDs de itens Únicos adquiridos neste save.
    this.uniqueItemIds = new Set();
  }

  add(item, category, { transferOwned = false } = {}) {
    if (!CATEGORIES.includes(category) || !item || typeof item !== 'object') return false;
    if (item.rarity === 'UNIQUE') {
      // Identidade do item, não timestamp da instância nem ID do combate.
      if (typeof item.id !== 'string' || !item.id ||
          (this.uniqueItemIds.has(item.id) && !transferOwned)) return false;
      this.uniqueItemIds.add(item.id);
    }
    this.items[category].push({ ...item, instanceId: this._genId() });
    return true;
  }

  remove(instanceId, category) {
    if (!CATEGORIES.includes(category)) return false;
    const before = this.items[category].length;
    this.items[category] = this.items[category].filter(i => i.instanceId !== instanceId);
    return this.items[category].length < before;
  }

  getAll(category) {
    return this.items[category] ?? [];
  }

  _genId() {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }

  serialize() {
    return {
      items: JSON.parse(JSON.stringify(this.items)),
      uniqueItemIds: [...this.uniqueItemIds],
    };
  }

  deserialize(data) {
    this.items = { weapons: [], armors: [], relics: [], consumables: [], materials: [], lore: [] };
    for (const cat of CATEGORIES) {
      if (Array.isArray(data?.items?.[cat])) this.items[cat] = data.items[cat];
    }
    // Compatibilidade com saves antigos: reconstruir a partir dos itens possuídos.
    // O histórico de itens já descartados só existe em saves feitos após esta mudança.
    this.uniqueItemIds = new Set(Array.isArray(data?.uniqueItemIds) ? data.uniqueItemIds : []);
    for (const cat of CATEGORIES) {
      for (const item of this.items[cat]) {
        if (item?.rarity === 'UNIQUE' && typeof item.id === 'string') {
          this.uniqueItemIds.add(item.id);
        }
      }
    }
  }
}

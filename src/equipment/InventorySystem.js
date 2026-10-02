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
  }

  add(item, category) {
    if (!CATEGORIES.includes(category)) return false;
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
    return { items: JSON.parse(JSON.stringify(this.items)) };
  }

  deserialize(data) {
    this.items = { weapons: [], armors: [], relics: [], consumables: [], materials: [], lore: [] };
    for (const cat of CATEGORIES) {
      if (data.items?.[cat]) this.items[cat] = data.items[cat];
    }
  }
}

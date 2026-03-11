import Dexie from 'dexie';

const db = new Dexie('BoxManagerDB');
db.version(1).stores({
  boxes: 'id, box_number, name, position, category_id',
  categories: 'id, name',
  settings: 'key'
});

const uuid = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
const now = () => new Date().toISOString();

// ==================== SETTINGS ====================
export const getSetting = async (key) => {
  const s = await db.settings.get(key);
  return s ? s.value : null;
};

export const setSetting = async (key, value) => {
  await db.settings.put({ key, value });
};

// ==================== CATEGORIES ====================
export const getCategories = async () => {
  const cats = await db.categories.toArray();
  return cats.map(c => ({ id: c.id, name: c.name, color: c.color }));
};

export const createCategory = async (data) => {
  const cat = { id: uuid(), name: data.name, color: data.color || '#6B7280' };
  await db.categories.add(cat);
  return cat;
};

export const updateCategory = async (id, data) => {
  await db.categories.update(id, { name: data.name, color: data.color });
  return { id, ...data };
};

export const deleteCategory = async (id) => {
  await db.categories.delete(id);
  return { success: true };
};

export const loadDefaults = async (names) => {
  const colors = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6','#F97316','#6366F1','#84CC16','#06B6D4'];
  const cats = names.map((name, i) => ({ id: uuid(), name, color: colors[i % colors.length] }));
  await db.categories.bulkAdd(cats);
  return cats;
};

// ==================== BOXES ====================
export const getBoxes = async (params) => {
  let boxes = await db.boxes.toArray();
  if (params?.category_id) boxes = boxes.filter(b => b.category_id === params.category_id);
  if (params?.location) boxes = boxes.filter(b => b.position === params.location);
  return boxes.map(b => ({
    id: b.id, box_number: b.box_number, name: b.name, position: b.position,
    category_id: b.category_id, item_count: (b.items || []).length, created_at: b.created_at
  }));
};

export const getBox = async (id) => {
  const box = await db.boxes.get(id);
  if (!box) throw new Error('Not found');
  return { id: box.id, box_number: box.box_number, name: box.name, position: box.position,
    category_id: box.category_id, items: box.items || [], created_at: box.created_at };
};

export const createBox = async (data) => {
  const allBoxes = await db.boxes.toArray();
  const maxNum = allBoxes.reduce((max, b) => Math.max(max, b.box_number || 0), 0);
  const box = {
    id: uuid(), box_number: maxNum + 1, name: data.name, position: data.position || '',
    category_id: data.category_id || '', items: [], created_at: now()
  };
  await db.boxes.add(box);
  return { id: box.id, box_number: box.box_number, name: box.name, position: box.position,
    category_id: box.category_id, item_count: 0, created_at: box.created_at };
};

export const updateBox = async (id, data) => {
  await db.boxes.update(id, { name: data.name, position: data.position, category_id: data.category_id });
  return await getBox(id);
};

export const deleteBox = async (id) => {
  await db.boxes.delete(id);
  return { success: true };
};

// ==================== ITEMS ====================
export const addItem = async (boxId, data) => {
  const box = await db.boxes.get(boxId);
  if (!box) throw new Error('Box not found');
  const item = { id: uuid(), name: data.name, description: data.description || '', image_data: data.image_data || null, created_at: now() };
  const items = [...(box.items || []), item];
  await db.boxes.update(boxId, { items });
  return item;
};

export const updateItem = async (boxId, itemId, data) => {
  const box = await db.boxes.get(boxId);
  if (!box) throw new Error('Box not found');
  const items = (box.items || []).map(it => it.id === itemId ? { ...it, ...data } : it);
  await db.boxes.update(boxId, { items });
  return items.find(it => it.id === itemId);
};

export const deleteItem = async (boxId, itemId) => {
  const box = await db.boxes.get(boxId);
  if (!box) throw new Error('Box not found');
  const items = (box.items || []).filter(it => it.id !== itemId);
  await db.boxes.update(boxId, { items });
  return { success: true };
};

// ==================== LOCATIONS ====================
export const getLocations = async () => {
  const boxes = await db.boxes.toArray();
  return [...new Set(boxes.map(b => b.position).filter(Boolean))];
};

// ==================== STATS ====================
export const getStats = async () => {
  const boxes = await db.boxes.toArray();
  const cats = await db.categories.count();
  const items = boxes.reduce((sum, b) => sum + (b.items || []).length, 0);
  return { total_boxes: boxes.length, total_items: items, total_categories: cats };
};

// ==================== SEARCH ====================
export const search = async (query) => {
  const q = (query || '').toLowerCase();
  if (!q) return [];
  const boxes = await db.boxes.toArray();
  const results = [];
  for (const box of boxes) {
    if (box.name?.toLowerCase().includes(q) || box.position?.toLowerCase().includes(q)) {
      results.push({ type: 'box', box_id: box.id, box_number: box.box_number, box_name: box.name, item_name: null, match: box.name });
    }
    for (const item of (box.items || [])) {
      if (item.name?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q)) {
        results.push({ type: 'item', box_id: box.id, box_number: box.box_number, box_name: box.name, item_name: item.name, match: item.name });
      }
    }
  }
  return results;
};

// ==================== BACKUP / RESTORE ====================
export const backup = async () => {
  const boxes = await db.boxes.toArray();
  const categories = await db.categories.toArray();
  const settings = await db.settings.toArray();
  return { version: '1.0', exported_at: now(), boxes, categories, settings };
};

export const restore = async (data) => {
  await db.boxes.clear();
  await db.categories.clear();
  await db.settings.clear();
  if (data.boxes?.length) await db.boxes.bulkAdd(data.boxes);
  if (data.categories?.length) await db.categories.bulkAdd(data.categories);
  if (data.settings?.length) await db.settings.bulkAdd(data.settings);
  return { success: true };
};

// ==================== CSV EXPORT ====================
export const exportCSV = async (boxIds) => {
  let boxes = await db.boxes.toArray();
  if (boxIds?.length) boxes = boxes.filter(b => boxIds.includes(b.id));
  const categories = await db.categories.toArray();
  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

  let csv = 'Numero Contenitore,Nome Contenitore,Posizione,Categoria,Nome Oggetto,Descrizione Oggetto\n';
  for (const box of boxes) {
    const catName = catMap[box.category_id] || '';
    if (!box.items?.length) {
      csv += `${box.box_number},"${box.name}","${box.position || ''}","${catName}","",""\n`;
    } else {
      for (const item of box.items) {
        csv += `${box.box_number},"${box.name}","${box.position || ''}","${catName}","${item.name}","${item.description || ''}"\n`;
      }
    }
  }
  return csv;
};

export default db;

import axios from 'axios';
import * as localDb from './localDb';

const API = process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : null;
export const IS_LOCAL = !API || API.includes('local');

// Parse path segments from URL: "/api/boxes/123/items/456" → ["boxes","123","items","456"]
const parsePath = (url) => {
  const clean = url.replace(API || '', '').replace(/^\/api\//, '/').replace(/^\//, '');
  return clean.split('/').filter(Boolean);
};

const parseParams = (config) => config?.params || {};

const localHandler = {
  get: async (url, config) => {
    const p = parsePath(url);
    const params = parseParams(config);

    if (p[0] === 'stats') return { data: await localDb.getStats() };
    if (p[0] === 'categories') return { data: await localDb.getCategories() };
    if (p[0] === 'auth' && p[1] === 'check') {
      const enabled = await localDb.getSetting('password_enabled');
      const username = await localDb.getSetting('username');
      return { data: { password_enabled: !!enabled, username: username || '' } };
    }
    if (p[0] === 'auth' && p[1] === 'settings') {
      const username = await localDb.getSetting('username');
      const pe = await localDb.getSetting('password_enabled');
      return { data: { username: username || '', password_enabled: !!pe } };
    }
    if (p[0] === 'boxes' && p[1] === 'locations') return { data: await localDb.getLocations() };
    if (p[0] === 'boxes' && p.length === 2) return { data: await localDb.getBox(p[1]) };
    if (p[0] === 'boxes') return { data: await localDb.getBoxes(params) };
    if (p[0] === 'search') return { data: await localDb.search(params.q) };
    if (p[0] === 'export' && p[1] === 'csv') {
      const ids = params.box_ids ? params.box_ids.split(',').filter(Boolean) : [];
      const csv = await localDb.exportCSV(ids);
      return { data: new Blob([csv], { type: 'text/csv' }) };
    }
    if (p[0] === 'backup') {
      const data = await localDb.backup();
      return { data: new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }) };
    }
    return { data: {} };
  },

  post: async (url, data) => {
    const p = parsePath(url);

    if (p[0] === 'categories' && p[1] === 'defaults') return { data: await localDb.loadDefaults(data.names) };
    if (p[0] === 'categories') return { data: await localDb.createCategory(data) };
    if (p[0] === 'auth' && p[1] === 'verify') {
      const enabled = await localDb.getSetting('password_enabled');
      if (!enabled) return { data: { success: true, message: 'Password disabilitata', password_enabled: false } };
      const storedPw = await localDb.getSetting('app_password');
      if (data.password === storedPw) return { data: { success: true } };
      const err = new Error('Password errata');
      err.response = { status: 401, data: { detail: 'Password errata' } };
      throw err;
    }
    if (p[0] === 'auth' && p[1] === 'settings') {
      await localDb.setSetting('username', data.username);
      await localDb.setSetting('password_enabled', data.password_enabled);
      return { data: { success: true, username: data.username, password_enabled: data.password_enabled } };
    }
    if (p[0] === 'auth' && p[1] === 'change-password') {
      const currentPw = await localDb.getSetting('app_password');
      if (data.current_password !== currentPw) {
        const err = new Error('Password errata');
        err.response = { status: 401, data: { detail: 'Password attuale errata' } };
        throw err;
      }
      await localDb.setSetting('app_password', data.new_password);
      return { data: { success: true } };
    }
    if (p[0] === 'auth' && p[1] === 'reset-password') {
      const MASTER = 'masterreset2025';
      if (data.master_password !== MASTER) {
        const err = new Error('Master password errata');
        err.response = { status: 401, data: { detail: 'Master password errata' } };
        throw err;
      }
      await localDb.setSetting('password_enabled', false);
      await localDb.setSetting('app_password', '');
      return { data: { success: true } };
    }
    if (p[0] === 'boxes' && p[2] === 'items') return { data: await localDb.addItem(p[1], data) };
    if (p[0] === 'boxes') return { data: await localDb.createBox(data) };
    if (p[0] === 'restore') {
      // data is FormData with a file
      if (data instanceof FormData) {
        const file = data.get('file');
        const text = await file.text();
        const json = JSON.parse(text);
        await localDb.restore(json);
        return { data: { success: true } };
      }
      return { data: { success: true } };
    }
    return { data: {} };
  },

  put: async (url, data) => {
    const p = parsePath(url);
    if (p[0] === 'categories') return { data: await localDb.updateCategory(p[1], data) };
    if (p[0] === 'boxes' && p[2] === 'items') return { data: await localDb.updateItem(p[1], p[3], data) };
    if (p[0] === 'boxes') return { data: await localDb.updateBox(p[1], data) };
    return { data: {} };
  },

  delete: async (url) => {
    const p = parsePath(url);
    if (p[0] === 'categories') return { data: await localDb.deleteCategory(p[1]) };
    if (p[0] === 'boxes' && p[2] === 'items') return { data: await localDb.deleteItem(p[1], p[3]) };
    if (p[0] === 'boxes') return { data: await localDb.deleteBox(p[1]) };
    return { data: {} };
  }
};

// Export an axios-compatible client
const apiClient = IS_LOCAL ? localHandler : axios;
export default apiClient;

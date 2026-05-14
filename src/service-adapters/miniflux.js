// src/adapters/miniflux.js
import { fetchMinifluxStatus } from './utils/monitoring-advanced-api.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    return await fetchMinifluxStatus(item.url, item.username, item.password);
  }
};

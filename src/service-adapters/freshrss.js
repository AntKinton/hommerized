// src/adapters/freshrss.js
import { fetchFreshRSSStatus } from './utils/monitoring-advanced-api.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    return await fetchFreshRSSStatus(item.url, item.username, item.password);
  }
};

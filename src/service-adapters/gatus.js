// src/adapters/gatus.js
import { fetchGatusStatus } from './utils/monitoring-advanced-api.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    return await fetchGatusStatus(item.url);
  }
};

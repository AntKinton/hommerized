// src/adapters/uptimekuma.js
import { fetchUptimeKumaStatus } from './utils/monitoring-api.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    return await fetchUptimeKumaStatus(item.url, item.slug);
  }
};

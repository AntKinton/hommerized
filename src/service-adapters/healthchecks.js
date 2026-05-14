// src/adapters/healthchecks.js
import { fetchHealthchecksStatus } from './utils/monitoring-api.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    return await fetchHealthchecksStatus(item.url, item.apikey);
  }
};

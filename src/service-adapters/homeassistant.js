// src/adapters/homeassistant.js
import { fetchHomeAssistantStatus } from './utils/monitoring-api.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    return await fetchHomeAssistantStatus(item.url, item.apikey);
  }
};

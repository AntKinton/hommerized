// src/adapters/portainer.js
import { fetchPortainerStatus } from './utils/monitoring-api.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    return await fetchPortainerStatus(item.url, item.username, item.password);
  }
};

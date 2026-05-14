// src/adapters/octoprint.js
import { fetchOctoPrintStatus } from './utils/download-manager-api.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    return await fetchOctoPrintStatus(item.url, item.apikey);
  }
};

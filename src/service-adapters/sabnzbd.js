// src/adapters/sabnzbd.js
import { fetchSABnzbdStatus } from './utils/download-manager-api.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    return await fetchSABnzbdStatus(item.url, item.apikey);
  }
};

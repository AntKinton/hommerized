// src/adapters/jellystat.js
import { fetchJellystatStatus } from './utils/media-server-api.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    return await fetchJellystatStatus(item.url, item.apikey);
  }
};

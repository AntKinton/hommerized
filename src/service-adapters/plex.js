// src/adapters/plex.js
import { fetchPlexStatus } from './utils/media-server-api.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    return await fetchPlexStatus(item.url, item.token);
  }
};

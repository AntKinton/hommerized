// src/adapters/gotify.js
import { fetchGotifyStatus } from './utils/service-status-api.js';
import { useService } from '../composables/useService.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    return await fetchGotifyStatus(item.url, item.apikey, fetch);
  }
};

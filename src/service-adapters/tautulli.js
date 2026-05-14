// src/adapters/tautulli.js
import { fetchTautulliStatus } from './utils/media-activity-api.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    return await fetchTautulliStatus(item.url, item.apikey, fetch);
  }
};

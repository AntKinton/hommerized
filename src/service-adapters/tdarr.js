// src/adapters/tdarr.js
import { fetchTdarrStatus } from './utils/task-queue-api.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    return await fetchTdarrStatus(item.url, fetch);
  }
};

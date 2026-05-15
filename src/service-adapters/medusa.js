import { useService } from "../composables/useService.js";
// src/adapters/medusa.js
import { fetchMedusaStatus } from './utils/task-queue-api.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    return await fetchMedusaStatus(item.url, item.apikey, fetch);
  }
};

import { useService } from "../composables/useService.js";
// src/adapters/caddy.js
import { fetchCaddyStatus } from './utils/service-status-api.js';

export default {
  archetype: 'StatusCard',
  
  async fetchData(item) {
    const { fetch } = useService(item);
    return await fetchCaddyStatus(item.url, fetch);
  }
};

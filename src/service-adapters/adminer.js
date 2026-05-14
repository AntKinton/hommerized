// src/adapters/adminer.js
import { fetchAdminerStatus } from './utils/service-status-api.js';

export default {
  archetype: 'StatusCard',
  
  async fetchData(item) {
    const { fetch } = useService(item);
    return await fetchAdminerStatus(item.url, fetch);
  }
};

// src/adapters/matrix.js
import { fetchMatrixStatus } from './utils/service-status-api.js';
import { useService } from '../composables/useService.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    return await fetchMatrixStatus(item.url, item.accesstoken, fetch);
  }
};

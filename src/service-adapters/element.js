// src/service-adapters/element.js
import { fetchMatrixStatus } from './utils/service-status-api.js';
import { useService } from '../composables/useService.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    // Element typically uses the same Matrix client API for status
    return await fetchMatrixStatus(item.url, item.accesstoken, fetch);
  }
};

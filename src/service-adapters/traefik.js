// src/adapters/traefik.js
import { fetchTraefikStatus } from './utils/service-status-api.js';
import { useService } from '../composables/useService.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    return await fetchTraefikStatus(item.url, item.basic_auth, fetch);
  }
};

// src/adapters/adguardhome.js
import { fetchAdGuardHomeStatus } from './utils/dns-adblocking-api.js';
import { useService } from '../composables/useService.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    return await fetchAdGuardHomeStatus(item.url, fetch);
  }
};

// src/adapters/transmission.js
import { fetchTransmissionStatus } from './utils/torrent-client-api.js';
import { useService } from '../composables/useService.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    return await fetchTransmissionStatus(item.url, item.username, item.password, fetch);
  }
};

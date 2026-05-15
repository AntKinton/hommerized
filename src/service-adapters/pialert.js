import { useService } from "../composables/useService.js";
// src/adapters/pialert.js
import { fetchPiAlertStatus } from './utils/network-monitoring-api.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    return await fetchPiAlertStatus(item.url, fetch);
  }
};

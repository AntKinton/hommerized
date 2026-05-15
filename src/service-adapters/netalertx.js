import { useService } from "../composables/useService.js";
// src/adapters/netalertx.js
import { fetchNetAlertxStatus } from './utils/network-monitoring-api.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    return await fetchNetAlertxStatus(item.url, item.apikey, fetch);
  }
};

import { useService } from "../composables/useService.js";
// src/adapters/openhab.js
import { fetchOpenHABStatus } from './utils/home-automation-api.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    return await fetchOpenHABStatus(item.url, item.apikey, fetch);
  }
};

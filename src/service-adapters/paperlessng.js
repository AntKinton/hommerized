import { useService } from "../composables/useService.js";
// src/adapters/paperlessng.js
import { fetchPaperlessNGStatus } from './utils/service-status-api.js';

export default {
  archetype: 'MetricCard',
  
  async fetchData(item) {
    const { fetch } = useService(item);
    return await fetchPaperlessNGStatus(item.url, item.apikey, fetch);
  }
};

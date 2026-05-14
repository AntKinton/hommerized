// src/adapters/glances.js
import { fetchGlancesMetrics } from './utils/monitoring-api.js';

export default {
  archetype: 'MetricCard',
  
  async fetch(item) {
    return await fetchGlancesMetrics(item.url);
  }
};

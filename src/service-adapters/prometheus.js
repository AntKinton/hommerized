// src/adapters/prometheus.js
import { fetchPrometheusStatus } from './utils/monitoring-advanced-api.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    return await fetchPrometheusStatus(item.url);
  }
};

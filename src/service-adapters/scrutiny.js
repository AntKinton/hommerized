// src/adapters/scrutiny.js
import { fetchScrutinyStatus } from './utils/monitoring-advanced-api.js';
import { useService } from '../composables/useService.js';

export default {
  archetype: 'MetricCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    const status = await fetchScrutinyStatus(item.url, fetch);
    
    // Transform to MetricCard format
    return [
      {
        label: 'Passed',
        value: status.details.passed,
        percentage: null,
        color: 'is-success'
      },
      {
        label: 'Failed',
        value: status.details.failed,
        percentage: null,
        color: status.details.failed > 0 ? 'is-danger' : 'is-light'
      },
      {
        label: 'Unknown',
        value: status.details.unknown,
        percentage: null,
        color: status.details.unknown > 0 ? 'is-warning' : 'is-light'
      },
      {
        label: 'Total',
        value: status.details.total,
        percentage: null,
        color: 'is-info'
      },
      {
        label: 'Pools',
        value: status.details.pools,
        percentage: null,
        color: 'is-primary'
      }
    ];
  }
};

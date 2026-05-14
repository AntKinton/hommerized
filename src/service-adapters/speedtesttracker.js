// src/adapters/speedtesttracker.js
import { fetchSpeedtestTrackerStatus } from './utils/service-status-api.js';
import { useService } from '../composables/useService.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    return await fetchSpeedtestTrackerStatus(item.url, fetch);
  }
};

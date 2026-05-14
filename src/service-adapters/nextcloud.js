// src/adapters/nextcloud.js
import { fetchNextcloudStatus } from './utils/service-status-api.js';
import { useService } from '../composables/useService.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    return await fetchNextcloudStatus(item.url, fetch);
  }
};

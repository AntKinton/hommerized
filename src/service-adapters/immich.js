// src/adapters/immich.js
import { fetchImmichStatus } from './utils/media-server-api.js';

export default {
  archetype: 'MetricCard',
  
  async fetchData(item) {
    const { fetch } = useService(item);
    return await fetchImmichStatus(item.url, item.apikey, fetch);
  }
};

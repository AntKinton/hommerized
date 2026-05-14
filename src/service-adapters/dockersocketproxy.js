// src/adapters/dockersocketproxy.js
import { fetchDockerSocketProxyStatus } from './utils/container-api.js';
import { useService } from '../composables/useService.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    return await fetchDockerSocketProxyStatus(item.url, fetch);
  }
};

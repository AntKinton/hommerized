// src/adapters/emby.js
import { fetchEmbyStatus } from './utils/media-server-api.js';

export default {
  archetype: 'MediaCard', // Changed to support Now Playing
  
  async fetchData(item) {
    const { fetch } = useService(item);
    return await fetchEmbyStatus(item.url, item.apikey, item.libraryType, fetch);
  }
};

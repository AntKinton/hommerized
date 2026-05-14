// src/adapters/rtorrent.js
import { fetchRtorrentStatus } from './utils/torrent-client-api.js';
import { useService } from '../composables/useService.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    return await fetchRtorrentStatus(item.url, fetch);
  }
};

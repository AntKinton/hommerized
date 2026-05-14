// src/adapters/readarr.js
import { fetchArrQueue } from './utils/arr-api.js';

export default {
  archetype: 'MediaCard',
  
  async fetch(item) {
    // MediaCard expects an array of "media" objects
    return await fetchArrQueue(item.url, item.apikey);
  }
};

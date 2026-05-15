import { useService } from "../composables/useService.js";
// src/adapters/wallabag.js
export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    
    try {
      const response = await fetch('');
      
      return {
        status: 'online',
        title: 'Wallabag running',
        subtitle: 'Read-it-later service accessible',
        details: {
          version: 'Unknown',
          rawData: response
        }
      };
    } catch (error) {
      return {
        status: 'offline',
        title: 'Connection failed',
        subtitle: 'Wallabag unavailable',
        details: {
          error: error.message,
          version: 'Unknown'
        }
      };
    }
  }
};

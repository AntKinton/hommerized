import { useService } from "../composables/useService.js";
// src/adapters/roundcube.js
export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    
    try {
      const response = await fetch('');
      
      return {
        status: 'online',
        title: 'Roundcube running',
        subtitle: 'Webmail accessible',
        details: {
          version: 'Unknown',
          rawData: response
        }
      };
    } catch (error) {
      return {
        status: 'offline',
        title: 'Connection failed',
        subtitle: 'Roundcube unavailable',
        details: {
          error: error.message,
          version: 'Unknown'
        }
      };
    }
  }
};

// src/adapters/postfix.js
import { useService } from '../composables/useService.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    
    try {
      const response = await fetch('api/v1/status');
      
      return {
        status: 'online',
        title: `Version ${response.version}`,
        subtitle: 'Postfix running',
        details: {
          version: response.version,
          config: response.config,
          hostname: response.hostname,
          mailname: response.mailname,
          rawData: response
        }
      };
    } catch (error) {
      return {
        status: 'offline',
        title: 'Connection failed',
        subtitle: 'Postfix unavailable',
        details: {
          error: error.message,
          version: 'Unknown',
          config: {},
          hostname: 'Unknown',
          mailname: 'Unknown'
        }
      };
    }
  }
};

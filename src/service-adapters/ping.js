// src/adapters/ping.js
import { useService } from '../composables/useService.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    
    try {
      const startTime = Date.now();
      const response = await fetch(item.url);
      const endTime = Date.now();
      
      // Calculate ping time in milliseconds
      const pingTime = endTime - startTime;
      
      return {
        status: 'online',
        title: `${pingTime}ms`,
        subtitle: 'Service reachable',
        details: {
          pingTime,
          url: item.url,
          responseTime: pingTime
        }
      };
    } catch (error) {
      return {
        status: 'offline',
        title: 'Connection failed',
        subtitle: 'Service unreachable',
        details: {
          error: error.message,
          url: item.url,
          pingTime: null
        }
      };
    }
  }
};

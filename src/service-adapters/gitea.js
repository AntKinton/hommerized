// src/adapters/gitea.js
import { useService } from '../composables/useService.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    
    try {
      const response = await fetch('swagger.v1.json');
      
      return {
        status: 'online',
        title: `Version ${response.info.version}`,
        subtitle: 'Gitea running',
        details: {
          version: response.info.version,
          buildTime: response.info.buildTime,
          rawData: response
        }
      };
    } catch (error) {
      return {
        status: 'offline',
        title: 'Connection failed',
        subtitle: 'Gitea unavailable',
        details: {
          error: error.message,
          version: 'Unknown'
        }
      };
    }
  }
};

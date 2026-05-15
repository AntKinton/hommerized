import { useService } from "../composables/useService.js";
// src/adapters/olivetin.js
export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    
    try {
      const response = await fetch('webUiSettings.json');
      
      return {
        status: 'online',
        title: `Version ${response.CurrentVersion || 'Unknown'}`,
        subtitle: 'Olivetin running',
        details: {
          version: response.CurrentVersion || 'Unknown',
          rawData: response
        }
      };
    } catch (error) {
      return {
        status: 'offline',
        title: 'Connection failed',
        subtitle: 'Olivetin unavailable',
        details: {
          error: error.message,
          version: 'Unknown'
        }
      };
    }
  }
};

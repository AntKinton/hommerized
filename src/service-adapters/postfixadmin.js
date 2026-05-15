import { useService } from "../composables/useService.js";
// src/adapters/postfixadmin.js
export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    
    try {
      const response = await fetch('');
      
      return {
        status: 'online',
        title: 'PostfixAdmin running',
        subtitle: 'Mail administration accessible',
        details: {
          version: 'Unknown',
          rawData: response
        }
      };
    } catch (error) {
      return {
        status: 'offline',
        title: 'Connection failed',
        subtitle: 'PostfixAdmin unavailable',
        details: {
          error: error.message,
          version: 'Unknown'
        }
      };
    }
  }
};

// src/adapters/mylar.js
import { useService } from '../composables/useService.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    
    try {
      const response = await fetch('api/v1/wanted');
      const data = response.data || [];
      
      const wanted = data.filter(item => item.monitored).length;
      const upcoming = data.filter(item => !item.monitored).length;
      
      return {
        status: wanted > 0 ? 'active' : upcoming > 0 ? 'warning' : 'idle',
        title: wanted > 0 ? `${wanted} wanted` : upcoming > 0 ? `${upcoming} upcoming` : 'No issues',
        subtitle: `${data.length} comics tracked`,
        details: {
          wanted,
          upcoming,
          total: data.length,
          comics: data
        }
      };
    } catch (error) {
      return {
        status: 'error',
        title: 'Connection failed',
        subtitle: 'Mylar unavailable',
        details: {
          error: error.message,
          wanted: 0,
          upcoming: 0,
          total: 0,
          comics: []
        }
      };
    }
  }
};

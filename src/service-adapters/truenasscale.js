// src/adapters/truenasscale.js
import { useService } from '../composables/useService.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    
    try {
      const response = await fetch('api/v2.0/release');
      
      return {
        status: 'online',
        title: `Version ${response.version}`,
        subtitle: 'TrueNAS Scale running',
        details: {
          version: response.version,
          fullVersion: response.full_version,
          buildDate: response.build_date,
          rawData: response
        }
      };
    } catch (error) {
      return {
        status: 'offline',
        title: 'Connection failed',
        subtitle: 'TrueNAS Scale unavailable',
        details: {
          error: error.message,
          version: 'Unknown',
          fullVersion: 'Unknown',
          buildDate: 'Unknown'
        }
      };
    }
  }
};

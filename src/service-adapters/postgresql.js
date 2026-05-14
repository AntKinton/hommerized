// src/adapters/postgresql.js
export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    
    try {
      const response = await fetch('');
      
      return {
        status: 'online',
        title: 'PostgreSQL running',
        subtitle: 'Database accessible',
        details: {
          version: 'Unknown',
          rawData: response
        }
      };
    } catch (error) {
      return {
        status: 'offline',
        title: 'Connection failed',
        subtitle: 'PostgreSQL unavailable',
        details: {
          error: error.message,
          version: 'Unknown'
        }
      };
    }
  }
};

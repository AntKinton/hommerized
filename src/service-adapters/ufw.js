// src/adapters/ufw.js
export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    
    try {
      const response = await fetch('');
      
      return {
        status: 'online',
        title: 'UFW running',
        subtitle: 'Firewall active',
        details: {
          version: 'Unknown',
          rawData: response
        }
      };
    } catch (error) {
      return {
        status: 'offline',
        title: 'Connection failed',
        subtitle: 'UFW unavailable',
        details: {
          error: error.message,
          version: 'Unknown'
        }
      };
    }
  }
};

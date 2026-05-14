// src/adapters/linkding.js
export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    
    try {
      const response = await fetch('');
      
      return {
        status: 'online',
        title: 'Linkding running',
        subtitle: 'Bookmark manager accessible',
        details: {
          version: 'Unknown',
          rawData: response
        }
      };
    } catch (error) {
      return {
        status: 'offline',
        title: 'Connection failed',
        subtitle: 'Linkding unavailable',
        details: {
          error: error.message,
          version: 'Unknown'
        }
      };
    }
  }
};

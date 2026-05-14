// src/adapters/ntfy.js
import { useService } from '../composables/useService.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    
    try {
      const response = await fetch('v1/stats');
      
      return {
        status: 'active',
        title: `${response.messages} messages`,
        subtitle: 'Ntfy service',
        details: {
          totalMessages: response.messages,
          totalTopics: response.topics,
          totalSubscriptions: response.subscriptions,
          rawData: response
        }
      };
    } catch (error) {
      return {
        status: 'error',
        title: 'Connection failed',
        subtitle: 'Ntfy unavailable',
        details: {
          error: error.message,
          totalMessages: 0,
          totalTopics: 0,
          totalSubscriptions: 0
        }
      };
    }
  }
};

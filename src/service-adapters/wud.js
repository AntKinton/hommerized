// src/adapters/wud.js
import { useService } from '../composables/useService.js';

export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    
    try {
      const response = await fetch('api/repos');
      const repos = response || [];
      
      const running = repos.filter(repo => repo.state === 'running').length;
      const update = repos.filter(repo => repo.state === 'update').length;
      
      return {
        status: running > 0 ? 'active' : update > 0 ? 'warning' : 'idle',
        title: running > 0 ? `${running} running` : update > 0 ? `${update} updates` : 'All up to date',
        subtitle: `${repos.length} repositories`,
        details: {
          running,
          update,
          total: repos.length,
          repositories: repos
        }
      };
    } catch (error) {
      return {
        status: 'error',
        title: 'Connection failed',
        subtitle: 'WUD unavailable',
        details: {
          error: error.message,
          running: 0,
          update: 0,
          total: 0,
          repositories: []
        }
      };
    }
  }
};

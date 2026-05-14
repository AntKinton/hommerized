// src/adapters/prowlarr.js
export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const res = await fetch(`${item.url}/api/v1/health?apikey=${item.apikey}`);
    if (!res.ok) throw new Error('Failed to fetch Prowlarr health');
    
    const health = await res.json();
    
    // Count warnings and errors for StatusCard
    const warnings = health.filter(h => h.type === 'warning').length;
    const errors = health.filter(h => h.type === 'error').length;
    
    return {
      status: errors > 0 ? 'error' : warnings > 0 ? 'warning' : 'healthy',
      title: errors > 0 ? `${errors} errors` : warnings > 0 ? `${warnings} warnings` : 'Healthy',
      subtitle: 'Prowlarr Indexer Manager'
    };
  }
};

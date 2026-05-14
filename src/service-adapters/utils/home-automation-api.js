// src/adapters/utils/home-automation-api.js
// Utility for Home Automation API normalization (OpenHAB)

export async function fetchOpenHABStatus(endpoint, apiKey, fetchFn) {
  const apiCall = fetchFn || fetch;
  
  try {
    const basicAuth = `${apiKey}:`;
    const headers = {
      'Authorization': `Basic ${btoa(basicAuth)}`
    };
    
    // Get system info first
    const systemResponse = await apiCall('rest/systeminfo', { headers });
    
    if (!systemResponse?.systemInfo) {
      throw new Error('Invalid system response');
    }
    
    const status = 'online';
    let details = {
      version: systemResponse.systemInfo.version || 'Unknown',
      buildString: systemResponse.systemInfo.buildString || 'Unknown'
    };
    
    // Get additional stats if configured
    const things = { count: 0, online: 0 };
    const items = { count: 0 };
    
    try {
      const thingsResponse = await apiCall('rest/things?summary=true', { headers });
      things.count = thingsResponse.length;
      things.online = thingsResponse.filter(e => e.statusInfo.status === 'ONLINE').length;
    } catch (e) {
      console.warn('Failed to fetch things:', e.message);
    }
    
    try {
      const itemsResponse = await apiCall('rest/items', { headers });
      items.count = itemsResponse.length;
    } catch (e) {
      console.warn('Failed to fetch items:', e.message);
    }
    
    details.things = things;
    details.items = items;
    
    return {
      status,
      title: 'OpenHAB Online',
      subtitle: `${things.online}/${things.count} things online`,
      details
    };
  } catch (error) {
    return {
      status: 'error',
      title: 'Connection failed',
      subtitle: 'OpenHAB unavailable',
      details: {
        error: error.message,
        version: 'Unknown',
        things: { count: 0, online: 0 },
        items: { count: 0 }
      }
    };
  }
}

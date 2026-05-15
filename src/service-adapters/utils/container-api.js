// src/adapters/utils/container-api.js
// Utility for Container Management API normalization (DockerSocketProxy, Portainer, etc.)

export async function fetchDockerSocketProxyStatus(endpoint, fetchFn) {
  const apiCall = fetchFn || fetch;
  
  try {
    const response = await apiCall('containers');
    const containers = response.containers || [];
    
    const running = containers.filter(c => c.state === 'running').length;
    const stopped = containers.filter(c => c.state === 'stopped').length;
    const errors = containers.filter(c => c.state === 'error').length;
    
    return {
      status: running > 0 ? 'active' : 'idle',
      title: `${running} running`,
      subtitle: stopped > 0 ? `${stopped} stopped` : 'All containers running',
      details: {
        running,
        stopped,
        errors,
        total: containers.length,
        containers
      }
    };
  } catch (error) {
    return {
      status: 'error',
      title: 'Connection failed',
      subtitle: 'Docker Socket Proxy unavailable',
      details: {
        error: error.message,
        running: 0,
        stopped: 0,
        errors: 1,
        total: 0
      }
    };
  }
}

export async function fetchPortainerContainerStatus(endpoint, username, password, fetchFn) {
  const apiCall = fetchFn || fetch;
  const auth = btoa(`${username}:${password}`);
  const headers = { 'Authorization': `Basic ${auth}` };
  
  try {
    // 1. Get all Docker environments (endpoints)
    const endpointsRes = await apiCall('api/endpoints', { headers });
    const endpoints = endpointsRes || [];
    
    let totalRunning = 0;
    let totalStopped = 0;
    
    // 2. Fetch containers for each active endpoint
    for (const env of endpoints) {
      if (env.Status === 1) { // If endpoint is UP
        try {
          const containersRes = await apiCall(`api/endpoints/${env.Id}/docker/containers/json?all=1`, { headers });
          const containers = containersRes || [];
          
          totalRunning += containers.filter(c => c.State === 'running').length;
          totalStopped += containers.filter(c => c.State !== 'running').length;
        } catch (_error) {
          console.warn(`Failed to fetch containers for endpoint ${env.Id}`);
        }
      }
    }
    
    return {
      status: totalRunning > 0 ? 'active' : 'idle',
      title: `${totalRunning} running`,
      subtitle: `${totalStopped} stopped`,
      details: { 
        running: totalRunning, 
        stopped: totalStopped,
        total: totalRunning + totalStopped,
        endpoints: endpoints.length
      }
    };
  } catch (error) {
    return { 
      status: 'error', 
      title: 'Connection failed',
      subtitle: 'Portainer unavailable',
      details: {
        error: error.message,
        running: 0,
        stopped: 0,
        total: 0
      }
    };
  }
}

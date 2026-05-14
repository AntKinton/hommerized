// src/adapters/utils/media-activity-api.js
// Utility for Media Activity API normalization (Tautulli)

export async function fetchTautulliStatus(endpoint, apiKey, fetchFn) {
  const apiCall = fetchFn || fetch;
  
  try {
    const response = await apiCall(`api/v2?apikey=${apiKey}&cmd=get_activity`);
    
    const streamCount = response?.response?.data?.stream_count || 0;
    
    return {
      status: streamCount > 0 ? 'active' : 'idle',
      title: streamCount > 0 ? `${streamCount} streams` : 'No activity',
      subtitle: streamCount > 0 ? 
        `${streamCount} active stream${streamCount > 1 ? 's' : ''}` : 
        'Plex idle',
      details: {
        streamCount,
        bandwidth: response?.response?.data?.bandwidth || 0,
        totalBandwidth: response?.response?.data?.total_bandwidth || 0,
        lanBandwidth: response?.response?.data?.lan_bandwidth || 0,
        wanBandwidth: response?.response?.data?.wan_bandwidth || 0
      }
    };
  } catch (error) {
    return {
      status: 'error',
      title: 'Connection failed',
      subtitle: 'Tautulli unavailable',
      details: {
        error: error.message,
        streamCount: 0,
        bandwidth: 0
      }
    };
  }
}

// src/adapters/utils/network-monitoring-api.js
// Utility for Network Monitoring API normalization (NetAlertx, PiAlert)

export async function fetchNetAlertxStatus(endpoint, apiKey, fetchFn) {
  const apiCall = fetchFn || fetch;
  
  try {
    const response = await apiCall('devices/totals', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    const total = response.total || response[0] || 0;
    const connected = response.connected || response[1] || 0;
    const newdevices = response.new || response[3] || 0;
    const downalert = response.down || response[4] || 0;
    
    return {
      status: connected > 0 ? 'active' : 'idle',
      title: `${connected} online`,
      subtitle: `${total} total devices`,
      details: {
        total,
        connected,
        newdevices,
        downalert,
        offline: total - connected
      }
    };
  } catch (error) {
    return {
      status: 'error',
      title: 'Connection failed',
      subtitle: 'NetAlertx unavailable',
      details: {
        error: error.message,
        total: 0,
        connected: 0,
        newdevices: 0,
        downalert: 0
      }
    };
  }
}

export async function fetchPiAlertStatus(endpoint, fetchFn) {
  const apiCall = fetchFn || fetch;
  
  try {
    const response = await apiCall('php/server/devices.php?action=getDevicesTotals');
    
    const total = response[0] || 0;
    const connected = response[1] || 0;
    const newdevices = response[3] || 0;
    const downalert = response[4] || 0;
    
    return {
      status: connected > 0 ? 'active' : 'idle',
      title: `${connected} online`,
      subtitle: `${total} total devices`,
      details: {
        total,
        connected,
        newdevices,
        downalert,
        offline: total - connected
      }
    };
  } catch (error) {
    return {
      status: 'error',
      title: 'Connection failed',
      subtitle: 'PiAlert unavailable',
      details: {
        error: error.message,
        total: 0,
        connected: 0,
        newdevices: 0,
        downalert: 0
      }
    };
  }
}

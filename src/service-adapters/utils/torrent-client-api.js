// src/adapters/utils/torrent-client-api.js
// Utility for Torrent Client API normalization (Transmission, qBittorrent, rTorrent)

export async function fetchTransmissionStatus(endpoint, username, password, fetchFn) {
  // Use provided fetch function or fallback to global fetch
  const apiCall = fetchFn || fetch;
  
  // First get session ID
  const sessionRes = await apiCall('transmission/rpc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(`${username}:${password}`)}`
    },
    body: JSON.stringify({
      method: 'session-get'
    })
  });
  
  if (!sessionRes.ok) throw new Error('Failed to get Transmission session');
  
  // Get torrent stats
  const statsRes = await apiCall('transmission/rpc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(`${username}:${password}`)}`
    },
    body: JSON.stringify({
      method: 'torrent-get',
      arguments: { fields: ['name', 'rateDownload', 'rateUpload', 'status'] }
    })
  });
  
  if (!statsRes.ok) throw new Error('Failed to fetch Transmission stats');
  const data = await statsRes.json();
  
  const torrents = data.result.torrents || [];
  const activeTorrents = torrents.filter(t => t.status !== 0).length;
  const totalDown = torrents.reduce((sum, t) => sum + (t.rateDownload || 0), 0);
  const totalUp = torrents.reduce((sum, t) => sum + (t.rateUpload || 0), 0);
  
  return {
    status: activeTorrents > 0 ? 'active' : 'idle',
    title: `${activeTorrents} torrents`,
    subtitle: `↓ ${formatSpeed(totalDown)} ↑ ${formatSpeed(totalUp)}`,
    details: {
      count: activeTorrents,
      downloadRate: totalDown,
      uploadRate: totalUp,
      torrents
    }
  };
}

export async function fetchQBittorrentStatus(endpoint, username, password, fetchFn) {
  // Use provided fetch function or fallback to global fetch
  const apiCall = fetchFn || fetch;
  
  // Login with automatic cookie management
  const loginRes = await apiCall('api/v2/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
    credentials: 'include' // Let browser handle cookies automatically
  });
  
  if (!loginRes.ok) throw new Error('Failed to login to qBittorrent');
  
  // Get torrent info with automatic cookie inclusion
  const infoRes = await apiCall('api/v2/torrents/info', {
    credentials: 'include' // Browser will automatically include the session cookie
  });
  
  if (!infoRes.ok) throw new Error('Failed to fetch qBittorrent info');
  const torrents = await infoRes.json();
  
  // Get transfer info with automatic cookie inclusion
  const transferRes = await apiCall('api/v2/transfer/info', {
    credentials: 'include' // Browser will automatically include the session cookie
  });
  
  if (!transferRes.ok) throw new Error('Failed to fetch qBittorrent transfer info');
  const transfer = await transferRes.json();
  
  const activeTorrents = torrents.filter(t => t.state !== 'paused' && t.state !== 'error').length;
  
  return {
    status: activeTorrents > 0 ? 'active' : 'idle',
    title: `${activeTorrents} torrents`,
    subtitle: `↓ ${formatSpeed(transfer.dl_info_speed)} ↑ ${formatSpeed(transfer.up_info_speed)}`,
    details: {
      count: activeTorrents,
      downloadRate: transfer.dl_info_speed,
      uploadRate: transfer.up_info_speed,
      torrents
    }
  };
}

export async function fetchRtorrentStatus(endpoint, fetchFn) {
  // Use provided fetch function or fallback to global fetch
  const apiCall = fetchFn || fetch;
  
  const res = await apiCall('plugins/rpc/rpc.php');
  
  if (!res.ok) throw new Error('Failed to fetch rTorrent status');
  const data = await res.json();
  
  // rTorrent XML-RPC response format
  const torrents = data.torrents || [];
  const activeTorrents = torrents.filter(t => t.state && t.state !== 0).length;
  const totalDown = data.download_rate || 0;
  const totalUp = data.upload_rate || 0;
  
  return {
    status: activeTorrents > 0 ? 'active' : 'idle',
    title: `${activeTorrents} torrents`,
    subtitle: `↓ ${formatSpeed(totalDown)} ↑ ${formatSpeed(totalUp)}`,
    details: {
      count: activeTorrents,
      downloadRate: totalDown,
      uploadRate: totalUp,
      torrents
    }
  };
}

// Helper function to format speed (bytes to human readable)
function formatSpeed(bytesPerSecond) {
  if (!bytesPerSecond || bytesPerSecond === 0) return '0 B/s';
  
  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  let speed = bytesPerSecond;
  let unitIndex = 0;
  
  while (speed >= 1024 && unitIndex < units.length - 1) {
    speed /= 1024;
    unitIndex++;
  }
  
  return `${speed.toFixed(1)} ${units[unitIndex]}`;
}

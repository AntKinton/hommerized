// src/adapters/utils/service-status-api.js
// Utility for Service Status APIs (Nextcloud, Vaultwarden, etc.)

export async function fetchNextcloudStatus(endpoint, fetchFn) {
  const apiCall = fetchFn || fetch;
  
  try {
    const response = await apiCall('status.php');
    
    return {
      status: response.maintenance ? 'maintenance' : 'online',
      title: `Version ${response.versionstring}`,
      subtitle: response.maintenance ? 'Maintenance mode' : 'Online',
      details: {
        version: response.versionstring,
        maintenance: response.maintenance,
        installed: response.installed,
        needsDbUpgrade: response.needsDbUpgrade,
        product: response.product,
        edition: response.edition
      }
    };
  } catch (error) {
    return {
      status: 'offline',
      title: 'Connection failed',
      subtitle: 'Service unavailable',
      details: {
        error: error.message
      }
    };
  }
}

export async function fetchVaultwardenStatus(endpoint, fetchFn) {
  const apiCall = fetchFn || fetch;
  
  try {
    const res = await apiCall('alive');
    
    return {
      status: res.connected ? 'healthy' : 'error',
      title: res.version ? `v${res.version}` : 'Vaultwarden',
      subtitle: res.connected ? 'Connected' : 'Disconnected',
      details: {
        version: res.version,
        connected: res.connected
      }
    };
  } catch (error) {
    return {
      status: 'error',
      title: 'Connection failed',
      subtitle: 'Vaultwarden unavailable',
      details: {
        error: error.message,
        version: 'Unknown',
        connected: false
      }
    };
  }
}

export async function fetchMatrixStatus(endpoint, accessToken, fetchFn) {
  const apiCall = fetchFn || fetch;
  
  try {
    const res = await apiCall('_matrix/client/r0/sync', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    return {
      status: 'healthy',
      title: 'Matrix Online',
      subtitle: `${res.rooms?.length || 0} rooms`,
      details: {
        rooms: res.rooms?.length || 0,
        user_id: res.user_id
      }
    };
  } catch (error) {
    return {
      status: 'error',
      title: 'Connection failed',
      subtitle: 'Matrix unavailable',
      details: {
        error: error.message,
        rooms: 0,
        user_id: 'Unknown'
      }
    };
  }
}

export async function fetchGotifyStatus(endpoint, appToken, fetchFn) {
  const apiCall = fetchFn || fetch;
  
  try {
    const res = await apiCall('application', {
      headers: { 'X-Gotify-Key': appToken }
    });
    
    return {
      status: 'healthy',
      title: `${res.applications?.length || 0} apps`,
      subtitle: 'Gotify Server',
      details: {
        applications: res.applications?.length || 0,
        version: res.version
      }
    };
  } catch (error) {
    return {
      status: 'error',
      title: 'Connection failed',
      subtitle: 'Gotify unavailable',
      details: {
        error: error.message,
        applications: 0,
        version: 'Unknown'
      }
    };
  }
}

export async function fetchTraefikStatus(endpoint, basicAuth, fetchFn) {
  const apiCall = fetchFn || fetch;
  
  const headers = {};
  if (basicAuth) {
    headers['Authorization'] = `Basic ${btoa(basicAuth)}`;
  }
  
  try {
    const response = await apiCall('api/version', { headers });
    
    return {
      status: 'online',
      title: `Version ${response.Version}`,
      subtitle: 'Traefik running',
      details: {
        version: response.Version,
        codename: response.Codename,
        gitCommit: response.GitCommit
      }
    };
  } catch (error) {
    return {
      status: 'offline',
      title: 'Connection failed',
      subtitle: 'Traefik unavailable',
      details: {
        error: error.message
      }
    };
  }
}

export async function fetchSpeedtestTrackerStatus(endpoint, fetchFn) {
  const apiCall = fetchFn || fetch;
  
  try {
    const response = await apiCall('api/speedtest/latest');
    const data = response.data;
    
    if (!data) {
      return {
        status: 'idle',
        title: 'No speedtests',
        subtitle: 'Run a speedtest to see results',
        details: {
          download: 0,
          upload: 0,
          ping: 0
        }
      };
    }
    
    const download = parseFloat(data.download || 0).toFixed(2);
    const upload = parseFloat(data.upload || 0).toFixed(2);
    const ping = parseFloat(data.ping || 0).toFixed(2);
    
    return {
      status: 'active',
      title: `${download} ↓ / ${upload} ↑ Mbit/s`,
      subtitle: `Ping: ${ping} ms`,
      details: {
        download: parseFloat(download),
        upload: parseFloat(upload),
        ping: parseFloat(ping),
        jitter: data.jitter ? parseFloat(data.jitter) : 0,
        server: data.server?.name || 'Unknown',
        created: data.created
      }
    };
  } catch (error) {
    return {
      status: 'offline',
      title: 'No data available',
      subtitle: 'Speedtest service unavailable',
      details: {
        error: error.message
      }
    };
  }
}

export async function fetchPiHoleStatus(endpoint, apiKey) {
  const res = await fetch(`${endpoint}/admin/api.php?summaryRaw&auth=${apiKey}`);
  if (!res.ok) throw new Error('Failed to fetch Pi-hole status');
  const data = await res.json();
  
  // Normalize data for StatusCard archetype
  return {
    status: data.status === 'enabled' ? 'healthy' : 'error',
    title: `${data.dns_queries_today} queries`,
    subtitle: `${Math.round((data.ads_blocked_today / data.dns_queries_today) * 100)}% blocked`,
    details: {
      queries: data.dns_queries_today,
      blocked: data.ads_blocked_today,
      percentage: Math.round((data.ads_blocked_today / data.dns_queries_today) * 100)
    }
  };
}

export async function fetchPostgreSQLStatus(endpoint, username, password) {
  const res = await fetch(`${endpoint}/info`, {
    headers: { 'Authorization': `Basic ${btoa(`${username}:${password}`)}` }
  });
  if (!res.ok) throw new Error('Failed to fetch PostgreSQL status');
  const data = await res.json();
  
  // Normalize data for StatusCard archetype
  return {
    status: 'healthy',
    title: `${data.version || 'PostgreSQL'}`,
    subtitle: `${data.connections || 0} connections`,
    details: {
      version: data.version,
      connections: data.connections,
      uptime: data.uptime
    }
  };
}

export async function fetchAdminerStatus(endpoint, fetchFn) {
  const apiCall = fetchFn || fetch;
  
  try {
    const response = await apiCall('/');
    const version = response.version || 'Unknown';
    
    return {
      status: 'active',
      title: 'Online',
      subtitle: `Version ${version}`,
      details: {
        version,
        endpoint: response
      }
    };
  } catch (error) {
    return {
      status: 'error',
      title: 'Connection failed',
      subtitle: 'Adminer unavailable',
      details: { error: error.message }
    };
  }
}

export async function fetchPaperlessNGStatus(endpoint, apiKey, fetchFn) {
  const apiCall = fetchFn || fetch;
  
  try {
    const headers = { 'Authorization': `Token ${apiKey}` };
    
    const documentsRes = await apiCall('api/documents/', { headers });
    const statsRes = await apiCall('api/statistics/', { headers });
    
    const documents = documentsRes.results || [];
    const stats = statsRes || {};
    
    return {
      status: 'active',
      title: `${documents.length} documents`,
      subtitle: `${stats.documents_processed || 0} processed`,
      metrics: [
        { label: 'Total', value: documents.length, icon: 'fa-file' },
        { label: 'Processed', value: stats.documents_processed || 0, icon: 'fa-check-circle' },
        { label: 'Inbox', value: stats.inbox_count || 0, icon: 'fa-inbox' },
        { label: 'Storage', value: formatBytes(stats.disk_usage || 0), icon: 'fa-database' }
      ],
      details: {
        documents: documents.length,
        processed: stats.documents_processed || 0,
        inbox: stats.inbox_count || 0,
        storage: stats.disk_usage || 0,
        stats
      }
    };
  } catch (error) {
    return {
      status: 'error',
      title: 'Connection failed',
      subtitle: 'PaperlessNG unavailable',
      details: { error: error.message }
    };
  }
}

export async function fetchCaddyStatus(endpoint, fetchFn) {
  const apiCall = fetchFn || fetch;
  
  try {
    const response = await apiCall('config/');
    const version = response.version || 'Unknown';
    
    return {
      status: 'active',
      title: 'Online',
      subtitle: `Version ${version}`,
      details: {
        version,
        config: response
      }
    };
  } catch (error) {
    return {
      status: 'error',
      title: 'Connection failed',
      subtitle: 'Caddy unavailable',
      details: { error: error.message }
    };
  }
}

// Helper function for formatting bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

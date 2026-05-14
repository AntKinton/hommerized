// src/adapters/utils/monitoring-advanced-api.js
// Utility for Advanced Monitoring APIs (Prometheus, Scrutiny, Proxmox, etc.)

export async function fetchPrometheusStatus(endpoint) {
  const res = await fetch(`${endpoint}/api/v1/alerts`);
  if (!res.ok) throw new Error('Failed to fetch Prometheus alerts');
  const data = await res.json();
  
  // Count alerts by severity
  const firing = data.data?.alerts?.filter(alert => alert.state === 'firing').length || 0;
  const pending = data.data?.alerts?.filter(alert => alert.state === 'pending').length || 0;
  
  // Normalize data for StatusCard archetype
  return {
    status: firing > 0 ? 'error' : pending > 0 ? 'warning' : 'healthy',
    title: `${firing} alerts`,
    subtitle: pending > 0 ? `${pending} pending` : 'All clear',
    details: {
      firing,
      pending,
      total: data.data?.alerts?.length || 0,
      alerts: data.data?.alerts || []
    }
  };
}

export async function fetchScrutinyStatus(endpoint, fetchFn) {
  const apiCall = fetchFn || fetch;
  
  try {
    // Get pool summary
    const poolsRes = await apiCall(`${endpoint}/api/summary`);
    const pools = poolsRes.data || [];
    
    // Get check results
    const checksRes = await apiCall(`${endpoint}/api/check`);
    const checks = checksRes.data || [];
    
    const passed = checks.filter(c => c.result === 'passed').length;
    const failed = checks.filter(c => c.result === 'failed').length;
    const unknown = checks.filter(c => c.result === 'unknown').length;
    
    return {
      status: passed > 0 ? 'healthy' : failed > 0 ? 'error' : 'warning',
      title: `${passed} passed`,
      subtitle: failed > 0 ? `${failed} failed` : 'All checks passed',
      details: {
        passed,
        failed,
        unknown,
        total: checks.length,
        pools: pools.length,
        checks,
        pools
      }
    };
  } catch (error) {
    return {
      status: 'error',
      title: 'Connection failed',
      subtitle: 'Scrutiny unavailable',
      details: {
        error: error.message,
        passed: 0,
        failed: 0,
        unknown: 0,
        total: 0,
        pools: 0
      }
    };
  }
}

export async function fetchProxmoxStatus(endpoint, username, password) {
  const auth = btoa(`${username}:${password}`);
  const res = await fetch(`${endpoint}/api2/json/cluster/resources`, {
    headers: { 'Authorization': `Basic ${auth}` }
  });
  if (!res.ok) throw new Error('Failed to fetch Proxmox status');
  const data = await res.json();
  
  // Extract VM and container counts
  const vms = data.data?.filter(item => item.type === 'qemu') || [];
  const containers = data.data?.filter(item => item.type === 'lxc') || [];
  const runningVms = vms.filter(vm => vm.status === 'running').length;
  const runningContainers = containers.filter(ct => ct.status === 'running').length;
  
  // Normalize data for StatusCard archetype
  return {
    status: (runningVms + runningContainers) > 0 ? 'active' : 'idle',
    title: `${runningVms + runningContainers} running`,
    subtitle: `${vms.length} VMs, ${containers.length} containers`,
    details: {
      vms: { running: runningVms, total: vms.length },
      containers: { running: runningContainers, total: containers.length }
    }
  };
}

export async function fetchFreshRSSStatus(endpoint, username, password) {
  const auth = btoa(`${username}:${password}`);
  const res = await fetch(`${endpoint}/api/greader.php/accounts/ClientLogin`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}`
    },
    body: `Email=${encodeURIComponent(username)}&Passwd=${encodeURIComponent(password)}`
  });
  
  if (!res.ok) throw new Error('Failed to login to FreshRSS');
  
  // Get subscriptions
  const subscriptionsRes = await fetch(`${endpoint}/api/greader.php/reader/api/0/subscription/list`, {
    headers: { 'Authorization': `Basic ${auth}` }
  });
  const subscriptions = await subscriptionsRes.json();
  
  // Get unread count
  const unreadRes = await fetch(`${endpoint}/api/greader.php/reader/api/0/unread-count`, {
    headers: { 'Authorization': `Basic ${auth}` }
  });
  const unreadData = await unreadRes.json();
  
  // Normalize data for StatusCard archetype
  return {
    status: 'healthy',
    title: `${subscriptions.max} subscriptions`,
    subtitle: `${unreadData.max} unread items`,
    details: {
      subscriptions: subscriptions.max,
      unread: unreadData.max
    }
  };
}

export async function fetchMinifluxStatus(endpoint, username, password) {
  const auth = btoa(`${username}:${password}`);
  
  // Get feeds
  const feedsRes = await fetch(`${endpoint}/api/greader.php/reader/api/0/subscription/list`, {
    headers: { 'Authorization': `Basic ${auth}` }
  });
  const feeds = await feedsRes.json();
  
  // Get unread items
  const unreadRes = await fetch(`${endpoint}/api/greader.php/reader/api/0/unread-count`, {
    headers: { 'Authorization': `Basic ${auth}` }
  });
  const unreadData = await unreadRes.json();
  
  // Normalize data for StatusCard archetype
  return {
    status: unreadData.max > 0 ? 'active' : 'idle',
    title: `${unreadData.max} unread`,
    subtitle: `in ${feeds.length} feeds`,
    details: {
      unread: unreadData.max,
      feeds: feeds.length
    }
  };
}

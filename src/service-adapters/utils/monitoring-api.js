// src/adapters/utils/monitoring-api.js
// Utility for Monitoring/Status API normalization (Glances, HomeAssistant, etc.)

export async function fetchGlancesStatus(endpoint) {
  const res = await fetch(`${endpoint}/api/4/quicklook`);
  if (!res.ok) throw new Error('Failed to fetch Glances status');
  const data = await res.json();
  
  // Normalize data for StatusCard archetype
  return {
    status: data.cpu > 80 ? 'warning' : 'healthy',
    title: `${data.cpu}% CPU`,
    subtitle: `${data.load}% load`,
    details: {
      cpu: data.cpu,
      load: data.load,
      memory: data.mem,
      disk: data.fs
    }
  };
}

export async function fetchGlancesMetrics(endpoint) {
  const res = await fetch(`${endpoint}/api/4/quicklook`);
  if (!res.ok) throw new Error('Failed to fetch Glances metrics');
  const data = await res.json();
  
  // Normalize data for MetricCard archetype
  return [
    {
      label: 'CPU',
      value: `${data.cpu}%`,
      percentage: data.cpu,
      color: data.cpu > 80 ? 'is-danger' : data.cpu > 60 ? 'is-warning' : 'is-primary'
    },
    {
      label: 'RAM',
      value: `${data.mem}%`,
      percentage: data.mem,
      color: data.mem > 85 ? 'is-danger' : data.mem > 70 ? 'is-warning' : 'is-info'
    },
    {
      label: 'Disk',
      value: `${data.fs}%`,
      percentage: data.fs,
      color: data.fs > 90 ? 'is-danger' : data.fs > 75 ? 'is-warning' : 'is-success'
    }
  ];
}

export async function fetchHomeAssistantStatus(endpoint, apiKey) {
  const res = await fetch(`${endpoint}/api`, {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  if (!res.ok) throw new Error('Failed to fetch Home Assistant status');
  const data = await res.json();
  
  // Normalize data for StatusCard archetype
  return {
    status: 'healthy',
    title: `v${data.version}`,
    subtitle: `${data.entities} entities`,
    details: {
      version: data.version,
      entities: data.entities,
      location: data.location_name
    }
  };
}

export async function fetchPortainerStatus(endpoint, username, password) {
  const auth = btoa(`${username}:${password}`);
  const res = await fetch(`${endpoint}/api/endpoints`, {
    headers: { 'Authorization': `Basic ${auth}` }
  });
  if (!res.ok) throw new Error('Failed to fetch Portainer status');
  const data = await res.json();
  
  // Count container states
  const running = data.filter(e => e.Status === 1).length;
  const stopped = data.filter(e => e.Status === 2).length;
  
  // Normalize data for StatusCard archetype
  return {
    status: running > 0 ? 'active' : 'idle',
    title: `${running} running`,
    subtitle: `${stopped} stopped`,
    details: {
      running,
      stopped,
      total: data.length
    }
  };
}

export async function fetchUptimeKumaStatus(endpoint, slug) {
  const dashboard = slug || 'default';
  const res = await fetch(`${endpoint}/api/status-page/${dashboard}`);
  if (!res.ok) throw new Error('Failed to fetch Uptime Kuma status');
  const data = await res.json();
  
  // Calculate uptime percentage
  const uptime = data.uptime24Hour;
  
  // Normalize data for StatusCard archetype
  return {
    status: uptime >= 99 ? 'healthy' : uptime >= 95 ? 'warning' : 'error',
    title: `${uptime.toFixed(1)}% uptime`,
    subtitle: '24 hours',
    details: {
      uptime24Hour: uptime,
      incident: data.incident
    }
  };
}

export async function fetchHealthchecksStatus(endpoint, apiKey) {
  const res = await fetch(`${endpoint}/api/v1/checks/`, {
    headers: { 'X-Api-Key': apiKey }
  });
  if (!res.ok) throw new Error('Failed to fetch Healthchecks status');
  const data = await res.json();
  
  // Count check statuses
  const up = data.checks?.filter(c => c.status === 'up').length || 0;
  const down = data.checks?.filter(c => c.status === 'down').length || 0;
  const grace = data.checks?.filter(c => c.status === 'grace').length || 0;
  
  // Normalize data for StatusCard archetype
  return {
    status: down > 0 ? 'error' : grace > 0 ? 'warning' : 'healthy',
    title: `${up} up`,
    subtitle: down > 0 ? `${down} down` : 'All checks passing',
    details: {
      up,
      down,
      grace,
      total: data.checks?.length || 0
    }
  };
}

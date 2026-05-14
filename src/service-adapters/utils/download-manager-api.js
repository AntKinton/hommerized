// src/adapters/utils/download-manager-api.js
// Utility for Download Manager API normalization (OctoPrint, SABnzbd, etc.)

export async function fetchOctoPrintStatus(endpoint, apiKey) {
  const res = await fetch(`${endpoint}/api/job`, {
    headers: { 'X-Api-Key': apiKey }
  });
  if (!res.ok) throw new Error('Failed to fetch OctoPrint status');
  const data = await res.json();
  
  // Find active print job
  const activeJob = data.jobs?.find(job => job.state === 'printing' || job.state === 'active');
  
  // Normalize data for StatusCard archetype
  return {
    status: activeJob ? 'active' : 'idle',
    title: activeJob ? activeJob.job.file.name : 'No active job',
    subtitle: activeJob ? `${Math.round((activeJob.job.completion || 0) * 100)}% complete` : 'Ready',
    details: {
      job: activeJob,
      totalJobs: data.jobs?.length || 0
    }
  };
}

export async function fetchSABnzbdStatus(endpoint, apiKey) {
  const res = await fetch(`${endpoint}/api?mode=queue`, {
    headers: { 'X-Api-Key': apiKey }
  });
  if (!res.ok) throw new Error('Failed to fetch SABnzbd status');
  const data = await res.json();
  
  // Normalize data for StatusCard archetype
  return {
    status: data.noofslots > 0 ? 'active' : 'idle',
    title: `${data.noofslots} active`,
    subtitle: `${data.mbspace_freed} MB free`,
    details: {
      activeDownloads: data.noofslots,
      totalSlots: data.slots,
      diskSpace: {
        free: data.mbspace_freed,
        total: data.mbspace_total
      }
    }
  };
}

export async function fetchGatusStatus(endpoint) {
  const res = await fetch(`${endpoint}/api/v1/checks`);
  if (!res.ok) throw new Error('Failed to fetch Gatus status');
  const data = await res.json();
  
  // Count check results
  const totalChecks = data.results?.length || 0;
  const passedChecks = data.results?.filter(check => check.status === 'pass').length || 0;
  const failedChecks = data.results?.filter(check => check.status === 'fail').length || 0;
  
  // Normalize data for StatusCard archetype
  return {
    status: failedChecks > 0 ? 'error' : passedChecks === totalChecks ? 'healthy' : 'warning',
    title: `${passedChecks}/${totalChecks} checks`,
    subtitle: failedChecks > 0 ? `${failedChecks} failed` : 'All passing',
    details: {
      total: totalChecks,
      passed: passedChecks,
      failed: failedChecks
    }
  };
}

export async function fetchSpeedtestStatus(endpoint) {
  const res = await fetch(`${endpoint}/api/speedtest/latest`);
  if (!res.ok) throw new Error('Failed to fetch Speedtest status');
  const data = await res.json();
  
  // Normalize data for StatusCard archetype
  return {
    status: 'healthy',
    title: `${data.download.bandwidth} Mbps`,
    subtitle: `Last test: ${new Date(data.timestamp).toLocaleDateString()}`,
    details: {
      download: data.download,
      upload: data.upload,
      ping: data.ping,
      timestamp: data.timestamp
    }
  };
}

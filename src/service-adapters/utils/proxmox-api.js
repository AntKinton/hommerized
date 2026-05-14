// src/adapters/utils/proxmox-api.js
// Utility for Proxmox API normalization (VMs, LXCs, system metrics)

export async function fetchProxmoxStatus(endpoint, username, password, fetchFn) {
  const apiCall = fetchFn || fetch;
  
  const auth = btoa(`${username}:${password}`);
  const headers = { 'Authorization': `Basic ${auth}` };
  
  try {
    // Get cluster resources (VMs, LXCs, storage, nodes)
    const resourcesRes = await apiCall('api2/json/cluster/resources', { headers });
    const resources = resourcesRes.data || [];
    
    // Get nodes for system metrics
    const nodesRes = await apiCall('api2/json/nodes', { headers });
    const nodes = nodesRes.data || [];
    
    // Calculate VMs and LXCs
    const vms = resources.filter(r => r.type === 'qemu');
    const lxcs = resources.filter(r => r.type === 'lxc');
    
    const vmsRunning = vms.filter(vm => vm.status === 'running').length;
    const lxcsRunning = lxcs.filter(lxc => lxc.status === 'running').length;
    
    // Calculate system metrics (average across nodes)
    let avgCpu = 0, avgMemory = 0, avgDisk = 0;
    let activeNodes = 0;
    
    for (const node of nodes) {
      if (node.status === 'online') {
        const nodeData = await apiCall(`api2/json/nodes/${node.node}/status`, { headers });
        if (nodeData.data) {
          avgCpu += nodeData.data.cpu || 0;
          avgMemory += nodeData.data.memory || 0;
          avgDisk += nodeData.data.rootfs || 0;
          activeNodes++;
        }
      }
    }
    
    if (activeNodes > 0) {
      avgCpu = Math.round(avgCpu / activeNodes);
      avgMemory = Math.round(avgMemory / activeNodes);
      avgDisk = Math.round(avgDisk / activeNodes);
    }
    
    return {
      status: vmsRunning > 0 || lxcsRunning > 0 ? 'active' : 'idle',
      title: `${vmsRunning + lxcsRunning} running`,
      subtitle: `${vmsRunning} VMs, ${lxcsRunning} LXCs`,
      details: {
        vms: {
          running: vmsRunning,
          total: vms.length
        },
        lxcs: {
          running: lxcsRunning,
          total: lxcs.length
        },
        system: {
          cpu: avgCpu,
          memory: avgMemory,
          disk: avgDisk,
          nodes: nodes.length,
          activeNodes
        },
        resources
      }
    };
  } catch (error) {
    return {
      status: 'error',
      title: 'Connection failed',
      subtitle: 'Proxmox unavailable',
      details: {
        error: error.message,
        vms: { running: 0, total: 0 },
        lxcs: { running: 0, total: 0 },
        system: { cpu: 0, memory: 0, disk: 0, nodes: 0, activeNodes: 0 }
      }
    };
  }
}

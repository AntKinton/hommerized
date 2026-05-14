// src/adapters/proxmox.js
import { fetchProxmoxStatus } from './utils/proxmox-api.js';
import { useService } from '../composables/useService.js';

export default {
  archetype: 'MetricCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    const status = await fetchProxmoxStatus(item.url, item.username, item.password, fetch);
    
    // Transform to MetricCard format
    return [
      {
        label: 'VMs',
        value: `${status.details.vms.running}/${status.details.vms.total}`,
        percentage: null,
        color: status.details.vms.running > 0 ? 'is-primary' : 'is-light'
      },
      {
        label: 'LXCs',
        value: `${status.details.lxcs.running}/${status.details.lxcs.total}`,
        percentage: null,
        color: status.details.lxcs.running > 0 ? 'is-info' : 'is-light'
      },
      {
        label: 'CPU',
        value: `${status.details.system.cpu}%`,
        percentage: status.details.system.cpu,
        color: status.details.system.cpu > 80 ? 'is-danger' : status.details.system.cpu > 60 ? 'is-warning' : 'is-success'
      },
      {
        label: 'Memory',
        value: `${status.details.system.memory}%`,
        percentage: status.details.system.memory,
        color: status.details.system.memory > 85 ? 'is-danger' : status.details.system.memory > 70 ? 'is-warning' : 'is-info'
      },
      {
        label: 'Disk',
        value: `${status.details.system.disk}%`,
        percentage: status.details.system.disk,
        color: status.details.system.disk > 90 ? 'is-danger' : status.details.system.disk > 75 ? 'is-warning' : 'is-success'
      }
    ];
  }
};

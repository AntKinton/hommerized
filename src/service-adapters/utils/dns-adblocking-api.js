// src/adapters/utils/dns-adblocking-api.js
// Utility for DNS/Ad-blocking API normalization (AdGuardHome, PiHole)

export async function fetchAdGuardHomeStatus(endpoint, fetchFn) {
  const apiCall = fetchFn || globalThis.fetch;
  
  try {
    // Get protection status
    const statusData = await apiCall('control/status');
    
    // Get blocking statistics
    const statsData = await apiCall('control/stats');
    
    const blockedPercentage = statsData.num_dns_queries > 0 
      ? ((statsData.num_blocked_filtering * 100) / statsData.num_dns_queries).toFixed(2)
      : '0';
    
    return {
      status: statusData.protection_enabled ? 'enabled' : 'disabled',
      title: `${blockedPercentage}% blocked`,
      subtitle: `${statsData.num_blocked_filtering} / ${statsData.num_dns_queries} queries`,
      details: {
        protectionEnabled: statusData.protection_enabled,
        blockedQueries: statsData.num_blocked_filtering,
        totalQueries: statsData.num_dns_queries,
        blockedPercentage: parseFloat(blockedPercentage)
      }
    };
  } catch (_error) {
    // Fallback to basic status if stats fail
    try {
      const statusData = await apiCall('control/status');
      return {
        status: statusData.protection_enabled ? 'enabled' : 'disabled',
        title: statusData.protection_enabled ? 'Protection enabled' : 'Protection disabled',
        subtitle: 'Stats unavailable',
        details: {
          protectionEnabled: statusData.protection_enabled,
          blockedQueries: 0,
          totalQueries: 0,
          blockedPercentage: 0
        }
      };
    } catch (_statusError) {
      throw new Error('Failed to fetch AdGuard Home status', { cause: _statusError });
    }
  }
}

export async function fetchPiHoleStatus(endpoint, apiKey, fetchFn) {
  const apiCall = fetchFn || globalThis.fetch;
  
  try {
    // Get summary statistics
    const summaryData = await apiCall('admin/api.php?summary', {
      headers: apiKey ? { 'X-PiHole-API-Key': apiKey } : {}
    });
    
    const blockedPercentage = summaryData.dns_queries_today > 0 
      ? ((summaryData.ads_blocked_today * 100) / summaryData.dns_queries_today).toFixed(2)
      : '0';
    
    const blockedNum = parseFloat(blockedPercentage);
    return [
      {
        label: 'Blocked',
        value: `${blockedPercentage}%`,
        percentage: blockedNum,
        color: blockedNum > 10 ? 'is-danger' : blockedNum > 5 ? 'is-warning' : 'is-success'
      },
      {
        label: 'Queries',
        value: summaryData.dns_queries_today.toString(),
        percentage: null,
        color: 'is-info'
      },
      {
        label: 'Blocked Today',
        value: summaryData.ads_blocked_today.toString(),
        percentage: null,
        color: 'is-primary'
      }
    ];
  } catch (_error) {
    throw new Error('Failed to fetch PiHole status', { cause: _error });
  }
}

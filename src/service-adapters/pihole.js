/**
 * Adapter for Pi-hole API
 * Maps specific Pi-hole data to the generic MetricCard archetype
 */
export default {
  // Define which UI archetype this service uses
  archetype: 'MetricCard',
  
  // Method to fetch and normalize data
  async fetchMetrics(endpoint, apiKey) {
    const res = await fetch(`${endpoint}/admin/api.php?summaryRaw&auth=${apiKey}`);
    const data = await res.json();
    
    // Return a standardized object that MetricCard.vue understands
    return [
      {
        label: 'Queries',
        value: data.dns_queries_today,
        color: 'is-info'
      },
      {
        label: 'Blocked',
        value: data.ads_blocked_today,
        color: 'is-danger',
        percentage: data.ads_percentage_today
      }
    ];
  }
};

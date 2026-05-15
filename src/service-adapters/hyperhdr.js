// src/service-adapters/hyperhdr.js
export default {
  archetype: "MetricCard",
  
  async fetch(service, fetcher) {
    const command = { command: "serverinfo" };
    const endpoint = `/json-rpc?request=${encodeURIComponent(JSON.stringify(command))}`;
    
    try {
      const response = await fetcher(endpoint);
      const instances = response?.info?.instance || [];
      const running = instances.filter(i => i.running === true).length;
      
      return {
        status: "online",
        metrics: [
          { label: "Running", value: running },
          { label: "Stopped", value: instances.length - running }
        ],
        footer: response?.info?.currentInstance ? `Instance: ${response.info.currentInstance}` : ""
      };
    } catch (e) {
      return { status: "offline", error: e.message };
    }
  }
};

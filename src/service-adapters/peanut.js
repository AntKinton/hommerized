// src/adapters/peanut.js
export default {
  archetype: 'StatusCard',
  
  async fetch(item) {
    const { fetch } = useService(item);
    
    try {
      const device = item.device || "";
      const response = await fetch(`api/v1/devices/${device}`);
      
      const upsStatus = response["ups.status"] || "";
      const upsLoad = response["ups.load"] || 0;
      
      let status = 'unknown';
      if (upsStatus === "OL") status = 'online';
      else if (upsStatus === "OB") status = 'warning';
      else if (upsStatus === "LB") status = 'offline';
      
      const statusText = {
        "OL": "online",
        "OB": "on battery", 
        "LB": "low battery"
      }[upsStatus] || "unknown";
      
      return {
        status,
        title: statusText,
        subtitle: upsLoad > 0 ? `${upsLoad.toFixed(1)}% UPS Load` : 'UPS Monitoring',
        details: {
          upsStatus,
          upsLoad,
          device,
          rawData: response
        }
      };
    } catch (error) {
      return {
        status: 'error',
        title: 'Connection failed',
        subtitle: 'PeaNUT unavailable',
        details: {
          error: error.message,
          upsStatus: 'unknown',
          upsLoad: 0
        }
      };
    }
  }
};

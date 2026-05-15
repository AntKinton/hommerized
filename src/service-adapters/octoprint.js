// src/service-adapters/octoprint.js
export default {
  archetype: "StatusCard",
  
  async fetch(service, fetcher) {
    try {
      const response = await fetcher("/api/job");
      const printer = await fetcher("/api/printer");
      
      
      
      return {
        status: printer ? "online" : "offline",
        state: response.state || "Unknown",
        completion: response.progress?.completion?.toFixed(1) || 0,
        printTime: response.progress?.printTime || 0,
        printTimeLeft: response.progress?.printTimeLeft || 0,
      };
    } catch (e) {
      return { status: "offline", error: e.message };
    }
  }
};

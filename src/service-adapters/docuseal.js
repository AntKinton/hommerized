import { serviceStatusApi } from "./utils/service-status-api.js";

export default {
  archetype: "StatusCard",
  
  async fetch(service, fetcher) {
    const status = await serviceStatusApi(service, fetcher, {
      endpoint: "/version",
      versionPath: (data) => data
    });
    
    return status;
  }
};

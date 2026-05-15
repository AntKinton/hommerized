import { serviceStatusApi } from "./utils/service-status-api.js";

export default {
  archetype: "StatusCard",
  
  async fetch(service, fetcher) {
    return await serviceStatusApi(service, fetcher, {
      endpoint: "/api/v1/server",
      versionPath: "version"
    });
  }
};
